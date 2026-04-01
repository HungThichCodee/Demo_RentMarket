package com.example.Indentity_service.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailService {

    JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    @lombok.experimental.NonFinal
    String senderEmail;

    public void sendResetPasswordEmail(String to, String otp) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject("Mã xác minh lấy lại mật khẩu - RentalMarket");

            String htmlContent = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <div style="background-color: #1b64f2; padding: 24px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">RentalMarket</h1>
                        </div>
                        <div style="padding: 32px; background-color: white;">
                            <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0;">Yêu cầu lấy lại mật khẩu</h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Xin chào,</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Chúng tôi nhận được yêu cầu lấy lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Dưới đây là mã xác minh của bạn:</p>
                            
                            <div style="text-align: center; margin: 32px 0;">
                                <div style="display: inline-block; background-color: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 16px 32px; font-size: 32px; font-weight: 700; color: #1b64f2; letter-spacing: 4px;">
                                    %s
                                </div>
                            </div>
                            
                            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Mã này sẽ hết hạn sau <strong>5 phút</strong>. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
                            <p style="color: #475569; font-size: 16px; line-height: 1.5;">Nếu bạn không yêu cầu lấy lại mật khẩu, xin hãy bỏ qua email này. Tài khoản của bạn vẫn được an toàn.</p>
                        </div>
                        <div style="background-color: #f8f9fa; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 14px; margin: 0;">&copy; 2024 RentalMarket. All rights reserved.</p>
                        </div>
                    </div>
                    """.formatted(otp);

            helper.setText(htmlContent, true);

            javaMailSender.send(message);
            log.info("Reset password email sent to {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}", to, e);
            throw new RuntimeException("Gửi email thất bại");
        }
    }
}
