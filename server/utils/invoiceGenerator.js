const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoicePdf = (order, user, program, batch, equipment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Theme Colors from tailwind.config.js
            const navy = '#0E215C';
            const red = '#D21F3C';
            const darkGrey = '#0B1120';
            const grey = '#64748B';

            // Top Header Band
            doc.rect(0, 0, 595.28, 120).fill(navy);
            
            // Add Logo
            const logoPath = path.join(__dirname, '../../client/public/logo and white word mark (4).png');
            let logoOffset = 0;
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 20, { fit: [200, 55] });
                logoOffset = 150;
            } else {
                doc.fillColor('#FFFFFF')
                   .fontSize(22)
                   .font('Helvetica-Bold')
                   .text('ARCHERY ACADEMY', 50, 35, { characterSpacing: 1 });
            }
            
            doc.fillColor('#FFFFFF')
               .fontSize(10)
               .font('Helvetica')
               .text('OFFICIAL PAYMENT RECEIPT', 50, 85, { characterSpacing: 1.5, color: '#D21F3C' });

            // Receipt Metadata
            doc.fillColor(darkGrey)
               .fontSize(12)
               .font('Helvetica-Bold')
               .text('INVOICE DETAILS', 50, 130);

            doc.moveTo(50, 145).lineTo(545, 145).strokeColor('#E2E8F0').lineWidth(1).stroke();

            const yMeta = 160;
            doc.fontSize(10).font('Helvetica').fillColor(grey);
            doc.text('Invoice Date:', 50, yMeta);
            doc.text('Transaction ID:', 50, yMeta + 18);
            doc.text('Payment Mode:', 50, yMeta + 36);

            doc.font('Helvetica-Bold').fillColor(darkGrey);
            doc.text(new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { dateStyle: 'long' }), 150, yMeta);
            doc.text(order.transactionId || 'N/A', 150, yMeta + 18);
            doc.text('Razorpay Gateway (Online)', 150, yMeta + 36);

            // Student Details (Right Column)
            doc.fontSize(12)
               .font('Helvetica-Bold')
               .fillColor(darkGrey)
               .text('STUDENT INFORMATION', 320, 130);

            const yStudent = 160;
            doc.fontSize(10).font('Helvetica').fillColor(grey);
            doc.text('Student ID:', 320, yStudent);
            doc.text('Full Name:', 320, yStudent + 18);
            doc.text('Email:', 320, yStudent + 36);
            doc.text('Mobile:', 320, yStudent + 54);

            doc.font('Helvetica-Bold').fillColor(darkGrey);
            doc.text(user.studentId || 'N/A', 400, yStudent);
            doc.text(`${user.firstName} ${user.lastName}`, 400, yStudent + 18);
            doc.text(user.email || 'N/A', 400, yStudent + 36);
            doc.text(user.mobile || 'N/A', 400, yStudent + 54);

            // Table Headers
            const yTable = 260;
            doc.rect(50, yTable, 495, 25).fill(red);

            doc.fillColor('#FFFFFF')
               .fontSize(9)
               .font('Helvetica-Bold')
               .text('DESCRIPTION', 60, yTable + 8);
            
            doc.text('LEVEL / BATCH', 250, yTable + 8);
            doc.text('AMOUNT', 480, yTable + 8, { align: 'right', width: 55 });

            // Table Rows
            let currentY = yTable + 25;

            // Row 1: Course Enrollment (if applicable)
            if (program || batch) {
                doc.fillColor(darkGrey).fontSize(10).font('Helvetica-Bold');
                doc.text(program ? program.title : 'Course Enrolment', 60, currentY + 12);
                doc.fontSize(9).font('Helvetica').fillColor(grey);
                
                let batchInfo = '';
                if (program && program.level) batchInfo += program.level;
                if (batch && batch.name) batchInfo += ` - ${batch.name}`;
                doc.text(batchInfo || 'General Level', 250, currentY + 12);
                
                doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGrey);
                doc.text(`INR ${program ? program.fees : 0}`, 480, currentY + 12, { align: 'right', width: 55 });
                
                currentY += 35;
            }

            // Row 2: Equipment (if selected)
            if (equipment) {
                doc.fillColor(darkGrey).fontSize(10).font('Helvetica-Bold');
                doc.text(equipment.name || 'Archery Equipment', 60, currentY + 12);
                doc.fontSize(9).font('Helvetica').fillColor(grey);
                doc.text('Product Purchase', 250, currentY + 12);
                
                doc.fontSize(10).font('Helvetica-Bold').fillColor(darkGrey);
                
                // Determine amount: if it's a direct equipment order, order.amount might be the equipment price. 
                // But we'll just use the order amount if it's purely equipment, or equipment.price if we have it.
                // However, the order might be just for equipment. Let's use order.amount if program isn't there.
                const eqPrice = program ? (equipment.price || 0) : order.amount;
                doc.text(`INR ${eqPrice}`, 480, currentY + 12, { align: 'right', width: 55 });
                
                currentY += 35;
            }

            // Subtotal & Total Section
            doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor('#E2E8F0').lineWidth(1).stroke();
            currentY += 15;

            doc.fontSize(10).font('Helvetica').fillColor(grey);
            doc.text('Subtotal:', 350, currentY);
            doc.font('Helvetica-Bold').fillColor(darkGrey);
            doc.text(`INR ${order.amount}`, 480, currentY, { align: 'right', width: 55 });

            currentY += 20;

            // Highlight Box for Grand Total
            doc.rect(320, currentY - 5, 225, 30).fill('#FFF5F5');
            doc.fontSize(11).font('Helvetica-Bold').fillColor(red);
            doc.text('GRAND TOTAL PAID:', 330, currentY + 5);
            doc.text(`INR ${order.amount}`, 480, currentY + 5, { align: 'right', width: 55 });

            // Footer info
            doc.fontSize(8)
               .font('Helvetica')
               .fillColor(grey)
               .text('Thank you for choosing Archery Academy. For any inquiries about your order, please contact our support team.', 50, 520, { align: 'center', width: 495, lineGap: 4 });

            doc.fontSize(8)
               .font('Helvetica-Bold')
               .fillColor(navy)
               .text('Archery Academy | Email: info@archery.com | Website: www.archery.com', 50, 560, { align: 'center', width: 495 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
