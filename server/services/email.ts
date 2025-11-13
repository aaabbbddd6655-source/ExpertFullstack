import type { Customer, Order, OrderStage, InstallationAppointment } from "@shared/schema";

export interface EmailService {
  sendOrderReceivedEmail(customer: Customer, order: Order): Promise<void>;
  sendStageChangedEmail(customer: Customer, order: Order, stage: OrderStage): Promise<void>;
  sendInstallationScheduledEmail(customer: Customer, appointment: InstallationAppointment): Promise<void>;
  sendRatingRequestEmail(customer: Customer, order: Order): Promise<void>;
}

export class ConsoleEmailService implements EmailService {
  async sendOrderReceivedEmail(customer: Customer, order: Order): Promise<void> {
    console.log("\n📧 ====== EMAIL: ORDER RECEIVED ======");
    console.log(`To: ${customer.email || customer.phone}`);
    console.log(`Subject: Order Confirmation - ${order.externalOrderId}`);
    console.log(`\nDear ${customer.fullName},`);
    console.log(`\nThank you for your order! We've received your custom interior order.`);
    console.log(`Order Number: ${order.externalOrderId}`);
    console.log(`Total Amount: $${order.totalAmount.toLocaleString()}`);
    console.log(`\nYou can track your order at any time using your phone number and order number.`);
    console.log(`\nWe'll keep you updated as your order progresses through each stage.`);
    console.log(`\nBest regards,\nThe Ivea Team`);
    console.log("=====================================\n");
  }

  async sendStageChangedEmail(customer: Customer, order: Order, stage: OrderStage): Promise<void> {
    const stageMessages: Record<string, { subject: string; message: string }> = {
      DESIGN_APPROVAL: {
        subject: "Design Ready for Your Review",
        message: "Your custom design is ready! Please review and approve it so we can proceed to production."
      },
      READY_FOR_INSTALL: {
        subject: "Ready for Installation",
        message: "Great news! Your order is ready for installation. Please confirm your preferred installation date."
      },
      INSTALLED: {
        subject: "Installation Complete - Share Your Feedback",
        message: "Your installation is complete! We'd love to hear about your experience. Please take a moment to rate our service."
      }
    };

    const config = stageMessages[stage.stageType];
    if (!config) return;

    console.log("\n📧 ====== EMAIL: STAGE UPDATE ======");
    console.log(`To: ${customer.email || customer.phone}`);
    console.log(`Subject: ${config.subject} - Order ${order.externalOrderId}`);
    console.log(`\nDear ${customer.fullName},`);
    console.log(`\n${config.message}`);
    if (stage.notes) {
      console.log(`\nAdditional Notes: ${stage.notes}`);
    }
    console.log(`\nOrder Number: ${order.externalOrderId}`);
    console.log(`Current Progress: ${order.progressPercent}%`);
    console.log(`\nBest regards,\nThe Ivea Team`);
    console.log("=====================================\n");
  }

  async sendInstallationScheduledEmail(customer: Customer, appointment: InstallationAppointment): Promise<void> {
    console.log("\n📧 ====== EMAIL: INSTALLATION SCHEDULED ======");
    console.log(`To: ${customer.email || customer.phone}`);
    console.log(`Subject: Installation Appointment Confirmed`);
    console.log(`\nDear ${customer.fullName},`);
    console.log(`\nYour installation has been scheduled!`);
    console.log(`\nDate & Time: ${new Date(appointment.scheduledAt).toLocaleString()}`);
    console.log(`Location: ${appointment.locationAddress}`);
    if (appointment.notes) {
      console.log(`Notes: ${appointment.notes}`);
    }
    console.log(`\nOur team will arrive on time and ensure professional installation.`);
    console.log(`\nBest regards,\nThe Ivea Team`);
    console.log("=====================================\n");
  }

  async sendRatingRequestEmail(customer: Customer, order: Order): Promise<void> {
    console.log("\n📧 ====== EMAIL: RATING REQUEST ======");
    console.log(`To: ${customer.email || customer.phone}`);
    console.log(`Subject: How Was Your Experience? - Order ${order.externalOrderId}`);
    console.log(`\nDear ${customer.fullName},`);
    console.log(`\nWe hope you're enjoying your new custom interior!`);
    console.log(`\nYour feedback is important to us. Please take a moment to rate your experience.`);
    console.log(`\nThank you for choosing Evia!`);
    console.log(`\nBest regards,\nThe Ivea Team`);
    console.log("=====================================\n");
  }
}

export const emailService = new ConsoleEmailService();
