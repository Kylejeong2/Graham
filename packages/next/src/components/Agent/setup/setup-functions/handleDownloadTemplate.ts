import { BUSINESS_INFO_TEMPLATE } from '@/constants/business-info-template';
import { jsPDF } from 'jspdf';

export const handleDownloadTemplate = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Business Information Template', 20, 20);
    
    let yPosition = 40;
    doc.setFontSize(12);

    BUSINESS_INFO_TEMPLATE.forEach(section => {
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, 20, yPosition);
        yPosition += 10;
        
        doc.setFont('helvetica', 'normal');
        section.items.forEach(item => {
            doc.text(item, 25, yPosition);
            yPosition += 10;
            
            doc.setDrawColor(200);
            doc.line(25, yPosition-2, 185, yPosition-2);
            yPosition += 10;
        });
        
        yPosition += 5;
        
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
    });

    doc.save('business_information_template.pdf');
};