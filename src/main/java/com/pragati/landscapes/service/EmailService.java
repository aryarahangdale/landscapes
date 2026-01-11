package com.pragati.landscapes.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderEmail(String name, String phone, String email,
                               String address, int quantity) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("pragatilandscapes@gmail.com");
        message.setSubject("New Order Received - Pragati Landscapes");

        message.setText(
                "New Order Details:\n\n" +
                "Name: " + name + "\n" +
                "Phone: " + phone + "\n" +
                "Email: " + email + "\n" +
                "Address: " + address + "\n" +
                "Quantity: " + quantity + " blocks"
        );

        mailSender.send(message);
    }
}
