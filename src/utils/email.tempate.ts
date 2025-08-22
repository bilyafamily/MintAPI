import { TicketResolutionEmailDto } from '../email/ticket-resoution.dto';

export const getResolutionEmailBody = (
  payload: TicketResolutionEmailDto,
): string => {
  return `
  <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TICKET RESOLUTION - NMDPRA</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }
        .content {
          padding: 24px !important;
        }
        .header {
          padding: 24px !important;
        }
        .logo {
          max-width: 70px !important;
        }
      }
    </style>
  </head>
  <body style="
    margin: 0;
    padding: 0;
    font-family: 'Inter', Arial, sans-serif;
    background-color: #f8f9fa;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  ">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="padding: 40px 0;">
      <tr>
        <td>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="
            margin: auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          " class="container">
            <!-- Top Border -->
            <tr>
              <td style="background-color: #00a86b; height: 6px;"></td>
            </tr>
            
            <!-- Logo Section -->
            <tr>
              <td style="background-color: #ffffff; padding: 32px 40px;" align="center" class="header">
                <img src="https://www.nmdpra.gov.ng/nmdpraimages/nmdpraLogo.png" alt="NMDPRA Logo" 
                  style="max-width: 100px; width: 100%; height: auto;" class="logo" />
              </td>
            </tr>

            <!-- Content Section -->
            <tr>
              <td style="
                background-color: #ffffff;
                padding: 0 48px 48px;
              " class="content">
                <h1 style="
                  margin: 0 0 24px;
                  font-size: 24px;
                  color: #111827;
                  font-weight: 600;
                  line-height: 1.4;
                ">Helpdesk Ticket Resolution Notification</h1>

                <p style="
                  margin: 0;
                  font-size: 16px;
                  color: #374151;
                  line-height: 1.6;
                ">Dear ${payload.name},</p>

                <p style="
                  margin: 16px 0;
                  font-size: 16px;
                  color: #374151;
                  line-height: 1.6;
                ">
                  We're pleased to inform you that your ticket with reference number <strong style="color: #111827;">${payload.ticketRef}</strong> has been successfully resolved.
                </p>

                <div style="
                  margin: 24px 0;
                  padding: 16px;
                  background-color: #f3f4f6;
                  border-radius: 8px;
                  color: #374151;
                  line-height: 1.6;
                ">
                 ${payload.comment}
                </div>

                <!-- Button Section -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://helpdesk.nmdpra.gov.ng/tickets/${payload.ticketId}" 
                    style="
                      background-color: #00a86b;
                      color: #ffffff;
                      padding: 14px 32px;
                      text-decoration: none;
                      font-weight: 500;
                      font-size: 16px;
                      border-radius: 8px;
                      display: inline-block;
                      transition: background-color 0.2s ease;
                      box-shadow: 0 2px 4px rgba(0, 168, 107, 0.1);
                    "
                    onmouseover="this.style.backgroundColor='#008f5a'"
                    onmouseout="this.style.backgroundColor='#00a86b'"
                  >View Ticket Details</a>
                </div>

                <!-- Footer -->
                <div style="
                  margin-top: 32px;
                  padding-top: 24px;
                  border-top: 1px solid #e5e7eb;
                ">
                  <p style="
                    margin: 0;
                    font-size: 16px;
                    color: #374151;
                    line-height: 1.6;
                  ">
                    <strong style="
                      color: #111827;
                      font-size: 16px;
                      display: block;
                      margin-top: 8px;
                    ">NMDPRA Support Team</strong>
                  </p>
                </div>
              </td>
            </tr>

            <!-- Bottom Section -->
            <tr>
              <td style="
                background-color: #f8f9fa;
                padding: 24px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
              ">
                <p style="
                  margin: 0;
                  font-size: 14px;
                  color: #6b7280;
                ">
                  This is an automated message. Please do not reply to this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
