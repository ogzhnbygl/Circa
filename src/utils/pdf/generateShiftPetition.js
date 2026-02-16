import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const loadFont = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Font yüklenemedi: ${url}`);
    const buffer = await response.arrayBuffer();

    // Convert to Base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export const generatePetition = async (month, year, shifts) => {
    const doc = new jsPDF();

    // Fetch and embed the fonts
    try {
        const [regularFont, boldFont] = await Promise.all([
            loadFont('/Tinos-Regular.ttf'),
            loadFont('/Tinos-Bold.ttf')
        ]);

        doc.addFileToVFS('Tinos-Regular.ttf', regularFont);
        doc.addFont('Tinos-Regular.ttf', 'Tinos', 'normal');

        doc.addFileToVFS('Tinos-Bold.ttf', boldFont);
        doc.addFont('Tinos-Bold.ttf', 'Tinos', 'bold');

        doc.setFont('Tinos');
    } catch (err) {
        console.warn('Font loading failed, falling back to standard font.', err);
    }

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const monthName = monthNames[month - 1];

    // --- Header ---
    doc.setFontSize(12);
    doc.setFont('Tinos', 'bold');
    doc.text('İSTANBUL MEDENİYET ÜNİVERSİTESİ', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.text('DENEY HAYVANLARI UYGULAMA VE ARAŞTIRMA MERKEZİ (İMU DEHAL) MÜDÜRLÜĞÜNE', 105, 35, { align: 'center' });

    // --- Subject ---
    doc.setFont('Tinos', 'normal');
    // Align "Konu:" explicitly
    const subjectPrefix = 'Konu:';
    const subjectContent = `${year} Yılı ${monthName} Ayı Mesai Takip Çizelgesi ve İzin Hak edişleri`;

    doc.setFont('Tinos', 'bold');
    doc.text(subjectPrefix, 14, 45);
    doc.setFont('Tinos', 'normal');
    doc.text(subjectContent, 28, 45); // Offset for content

    // --- Body ---
    doc.setFont('Tinos', 'normal');
    const bodyText = `Merkezimizde yürütülmekte olan projeler ve laboratuvar operasyonları kapsamında, personelimizin ${year} yılı ${monthName} ayı içerisinde gerçekleştirdiği fazla mesai çalışmaları aşağıda tablolaştırılmıştır:`;

    const splitBody = doc.splitTextToSize(bodyText, 180);
    doc.text(splitBody, 14, 55);

    // --- Table Data Preparation ---
    const tableColumn = ["Personel Adı Soyad", "Tarih", "Giriş Saati", "Çıkış Saati", "Toplam Süre"];
    const tableRows = [];

    const sortedShifts = [...shifts].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedShifts.forEach(shift => {
        const dateStr = new Date(shift.date).toLocaleDateString('tr-TR');
        const start = parseInt(shift.startTime.split(':')[0]);
        const end = parseInt(shift.endTime.split(':')[0]);
        let duration = end - start;
        if (duration < 0) duration += 24;

        const rowData = [
            shift.name || shift.email,
            dateStr,
            shift.startTime,
            shift.endTime,
            `${duration} Saat`
        ];
        tableRows.push(rowData);
    });

    // --- Table ---
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'plain',
        styles: {
            font: 'Tinos',
            fontSize: 10,
            cellPadding: 3,
            lineWidth: 0,
        },
        headStyles: {
            fillColor: [240, 240, 240],
            textColor: 20,
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: {
            halign: 'left'
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 30 },
        }
    });

    // --- Summary Calculations ---
    const summaryY = doc.lastAutoTable.finalY + 15;

    const userTotals = {};

    shifts.forEach(shift => {
        const start = parseInt(shift.startTime.split(':')[0]);
        const end = parseInt(shift.endTime.split(':')[0]);
        let hours = end - start;
        if (hours < 0) hours += 24;

        let multiplier = 1.0;
        if (shift.shiftType === 'weekend') multiplier = 1.5;
        if (shift.shiftType === 'holiday') multiplier = 2.0;

        const earned = hours * multiplier;
        const email = shift.email;
        const name = shift.name || email;

        if (!userTotals[email]) {
            userTotals[email] = { name, total: 0 };
        }
        userTotals[email].total += earned;
    });

    // --- Summary Section ---
    // Check page break
    let currentY = summaryY;
    if (currentY > 250) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFont('Tinos', 'bold');
    doc.text('İcmal ve Sonuç', 14, currentY);

    doc.setFont('Tinos', 'normal');
    const summaryIntro = `Yukarıdaki tabloda belirtilen mesai giriş-çıkış ayrıntılarına istinaden, ilgili personelin ${monthName} ayı toplam fazla mesai karşılığı izin hakları şu şekildedir:`;
    const splitSummary = doc.splitTextToSize(summaryIntro, 180);
    // Add text starting below the meaningful title
    doc.text(splitSummary, 14, currentY + 7);

    // Calculate height of the summary text to properly position the bullets
    const summaryDimensions = doc.getTextDimensions(splitSummary);
    currentY += 7 + summaryDimensions.h + 5; // Title margin + Text height + Spacing

    Object.values(userTotals).forEach(user => {
        // Bullet point alignment
        doc.text(`• ${user.name}: ${user.total} Saat`, 20, currentY);
        currentY += 7;
    });

    // --- Closing ---
    const closingY = currentY + 10;
    if (closingY > 270) {
        doc.addPage();
        currentY = 20;
    } else {
        currentY = closingY;
    }

    const closingText = "Söz konusu fazla mesai saatlerinin, personelin izin hak edişlerine eklenmesi ve dosyasına işlenmesi hususunu bilgilerinize arz ederim.";
    const splitClosing = doc.splitTextToSize(closingText, 180);
    doc.text(splitClosing, 14, currentY);

    // --- Footer ---
    const footerY = currentY + 20;
    const today = new Date().toLocaleDateString('tr-TR');

    doc.setFont('Tinos', 'bold');
    doc.text(`Tarih: ${today}`, 190, footerY, { align: 'right' });

    doc.text('Onaylayan Yetkili', 190, footerY + 22, { align: 'right' });

    doc.save(`${year}-${monthName}-Mesai-Dilekcesi.pdf`);
};
