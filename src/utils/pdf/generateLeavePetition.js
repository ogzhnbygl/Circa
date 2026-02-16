import jsPDF from 'jspdf';

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

export const generateLeavePetition = async (user, leaveRequest, totalBalance) => {
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

    // --- Header ---
    doc.setFontSize(12);
    doc.setFont('Tinos', 'bold');
    doc.text('İSTANBUL MEDENİYET ÜNİVERSİTESİ', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.text('DENEY HAYVANLARI UYGULAMA VE ARAŞTIRMA MERKEZİ (İMU DEHAL) MÜDÜRLÜĞÜNE', 105, 35, { align: 'center' });

    // --- Subject ---
    doc.setFont('Tinos', 'bold');
    doc.text('Konu: Mesai İzni Kullanımı Hakkında', 14, 50);

    // --- Body ---
    doc.setFont('Tinos', 'normal');

    // Formatting dates
    // Assuming leaveRequest has startDate, endDate (or singleDate), and totalHours
    // If unit is daily, loop through dates to find start/end. If hourly, singleDate.

    let startDateStr = '';
    let endDateStr = '';

    if (leaveRequest.unit === 'daily' && leaveRequest.dates && leaveRequest.dates.length > 0) {
        // Sort dates just in case
        const sortedDates = [...leaveRequest.dates].sort();
        startDateStr = new Date(sortedDates[0]).toLocaleDateString('tr-TR');
        endDateStr = new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString('tr-TR');
    } else if (leaveRequest.unit === 'hourly' && leaveRequest.singleDate) {
        startDateStr = new Date(leaveRequest.singleDate).toLocaleDateString('tr-TR') + ' ' + leaveRequest.startTime;
        endDateStr = new Date(leaveRequest.singleDate).toLocaleDateString('tr-TR') + ' ' + leaveRequest.endTime;
    } else {
        // Fallback
        startDateStr = '...';
        endDateStr = '...';
    }

    // "Mesai Hakkının Doğduğu Tarih" - user didn't specify where this comes from. 
    // Usually start of year or employment. putting a placeholder or current year start?
    // User text: "[Mesai Hakkının Doğduğu Tarih] tarihinden itibaren..."
    const workRightDate = `01.01.${new Date().getFullYear()}`;

    const bodyText1 = `${workRightDate} tarihinden itibaren gerçekleştirmiş olduğum çalışmalar neticesinde toplam ${totalBalance} saat fazla mesai izin hakkım bulunmaktadır.`;
    const bodyText2 = `Söz konusu fazla mesai alacaklarıma istinaden, ${startDateStr} ile ${endDateStr} tarihleri arasında toplam ${leaveRequest.totalHours} saat mesai izni kullanmak istiyorum.`;
    const bodyText3 = "Gereğini bilgilerinize arz ederim.";
    const bodyText4 = "Saygılarımla,";

    let currentY = 70;
    const splitBody1 = doc.splitTextToSize(bodyText1, 180);
    doc.text(splitBody1, 14, currentY);
    currentY += doc.getTextDimensions(splitBody1).h + 10;

    const splitBody2 = doc.splitTextToSize(bodyText2, 180);
    doc.text(splitBody2, 14, currentY);
    currentY += doc.getTextDimensions(splitBody2).h + 10;

    doc.text(bodyText3, 14, currentY);
    currentY += 20;

    doc.text(bodyText4, 14, currentY);

    // --- Footer / Signature ---
    // --- Footer / Signature ---
    const footerY = currentY + 30;
    const today = new Date().toLocaleDateString('tr-TR');

    doc.text(`Tarih: ${today}`, 190, footerY, { align: 'right' });
    doc.text(`Ad Soyad: ${user.name || user.email}`, 190, footerY + 8, { align: 'right' });
    doc.text('İmza: ____________________', 190, footerY + 16, { align: 'right' });

    doc.save(`Izin-Dilekcesi-${startDateStr}.pdf`);
};
