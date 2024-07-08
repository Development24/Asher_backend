import { Request, Response } from "express";
import EmailService from "../services/emailService";
import { CustomRequest, EmailDataType } from "../utils/types";


class EmailController {

    private emailService: EmailService
    constructor(emailService: EmailService) {
        this.emailService = emailService
    }

    async createEmail(req: CustomRequest, res: Response) {
        try {
            const emailData: EmailDataType = req.body
            emailData.senderEmail = String(req.user.email)
            const email = await this.emailService.createEmail(emailData);
            return res.status(201).json(email)
        } catch (error) {
            return res.status(500).json({ message: 'Failed to create email' })
        }
    }

    async getUserInbox(req: Request, res: Response) {
        try {
            const email = String(req.params.email);
            const emails = await this.emailService.getUserEmails(email, { recieved: true })
            return res.status(200).json(emails)

        } catch (error) {
            return res.status(500).json({ message: 'Failed to fetch email' })

        }
    }

    async getEmailById(req: Request, res: Response) {
        try {
            const emailId = BigInt(req.params.emailId);
            const email = await this.emailService.getEmailById(emailId)
            if (!email) return res.status(404).json({ message: "Email not found" })
            return res.status(200).json(email)
        } catch (error) {
            return res.status(500).json({ message: "Failed to get email" })
        }
    }

    async updateEmail(req: CustomRequest, res: Response) {
        try {
            const emailId = BigInt(req.params.emailId);
            //get the email
            const email = await this.emailService.getEmailById(emailId);
            if (!email) return res.status(404).json({ message: 'Email not found' })

            //check userId if he owns the email
            if (email.senderEmail !== String(req.user.email)) {
                return res.status(403).json({ message: 'Forbbiden' })
            }
            const updatedEmail = await this.emailService.updateEmail(emailId, req.body);
            return res.status(200).json(updatedEmail)
        } catch (error) {
            return res.status(500).json({ message: "Failed to update email" })
        }
    }

    async deleteEmail(req: CustomRequest, res: Response) {
        try {
            const emailId = BigInt(req.params.emailId)
            //get the email
            const email = await this.emailService.getEmailById(emailId);
            if (!email) return res.status(404).json({ message: 'Email not found' })

            //check userId if he owns the email
            if (email.senderEmail !== String(req.user.email)) {
                return res.status(403).json({ message: 'Forbbiden' })
            }

            //store the email in fail safe db

            await this.emailService.deleteEmail(emailId)
            return res.status(200).json({ message: "Email deleted successfully" })
        } catch (error) {
            return res.status(500).json({ message: "Failed to delete email" })
        }
    }

    async getUserSentEmails(req: Request, res: Response) {
        try {
            const email = String(req.params.email);
            const emails = await this.emailService.getUserEmails(email, { sent: true })
            if (emails.length < 1) return res.status(200).json({ message: "No sent emails" })
            return res.status(200).json(emails)
        } catch (error) {
            return res.status(500).json({ message: "Failed to get sent emails" })
        }
    }

    async getUserDraftEmails(req: Request, res: Response) {
        try {
            const email = String(req.params.email)
            const emails = await this.emailService.getUserEmails(email, { draft: true })
            if (emails.length < 1) return res.status(200).json({ message: "No draft emails" })
            return res.status(200).json(emails)
        } catch (error) {
            return res.status(500).json({ message: "Couldnt get Draft emails" })
        }
    }

    async getUserUnreadEmails(req: Request, res: Response) {
        try {
            const email = String(req.params.email)
            const emails = await this.emailService.getUserEmails(email, { recieved: true, unread: true })
            if (emails.length < 1) return res.status(200).json({ message: "No Unread Emails" })
            return res.status(200).json(emails)
        } catch (error) {
            return res.status(500).json({ message: "Couldnt get unread emails" })
        }
    }

    async markEmailAsRead(req: CustomRequest, res: Response) {
        try {
            const emailId = BigInt(req.params.userId)

            const email = await this.emailService.getEmailById(emailId)
            if (email.senderEmail !== String(req.user.email)) {
                return res.status(403).json({ message: 'Forbbiden' })
            }
            const updatedEmail = await this.emailService.markEmailAsRead(emailId)
            return res.status(200).json(updatedEmail)
        } catch (error) {
            return res.status(500).json({ message: "Couldnt read email" })
        }
    }

    async sendDraftEmail(req: CustomRequest, res: Response) {
        try {
            const emailId = BigInt(req.params.userId)

            const email = await this.emailService.getEmailById(emailId)
            if (email.senderEmail !== String(req.user.email)) {
                return res.status(403).json({ message: 'Forbbiden' })
            }
            const sentEmail = await this.emailService.sendDraftEmail(emailId)
            return res.status(200).json(sentEmail)
        } catch (error) {
            return res.status(500).json({ message: "Couldn't send draft email" })
        }
    }
}

const emailService = new EmailService()
export default new EmailController(emailService)