package com.pragati.landscapes.controller;

import com.pragati.landscapes.model.Order;
import com.pragati.landscapes.model.OrderRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.pragati.landscapes.service.EmailService;


@Controller
public class OrderController {

    @Autowired
    private OrderRepository repo;

    @Autowired
    private EmailService emailService;
    
    @GetMapping("/")
    public String showHome(Model model) {
        model.addAttribute("order", new Order());
        return "index";
    }
    @GetMapping("/thankyou")
    public String thankYou() {
        return "thankyou";
    }

    @PostMapping("/order")
    public String submitOrder(
            @Valid @ModelAttribute Order order,
            BindingResult result,
            RedirectAttributes msg) {

        if (result.hasErrors()) {
            return "index";
        }

        repo.save(order);

        try {
            emailService.sendOrderEmail(
                    order.getName(),
                    order.getPhone(),
                    order.getEmail(),
                    order.getAddress(),
                    order.getQuantity()
            );
        } catch (Exception e) {
            System.out.println("Email failed: " + e.getMessage());
        }

        msg.addFlashAttribute("success", "Thank you! Order placed.");
        return "redirect:/";

    }
}
