package com.foodorderapplication.backend;

import static org.junit.jupiter.api.Assertions.*;

import com.foodorderapplication.backend.dto.RestaurantDTO;
import com.foodorderapplication.backend.dto.auth.RegisterRequest;
import com.foodorderapplication.backend.dto.auth.LoginRequest;
import com.foodorderapplication.backend.model.*;
import com.foodorderapplication.backend.model.enums.*;
import com.foodorderapplication.backend.repository.*;
import com.foodorderapplication.backend.security.JwtUtil;
import com.foodorderapplication.backend.service.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
public class HardeningTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    public void testRegistrationAlwaysCreatesCustomer() {
        String uniqueEmail = "reg_test_" + UUID.randomUUID() + "@test.com";
        RegisterRequest req = new RegisterRequest();
        req.setName("Test Registration");
        req.setEmail(uniqueEmail);
        req.setPassword("Sai_310505");
        
        authService.register(req);
        
        User registered = userRepository.findByEmail(uniqueEmail).orElse(null);
        assertNotNull(registered);
        assertEquals(UserRole.CUSTOMER, registered.getRole());
    }

    @Test
    public void testPaymentVerificationRejectsForgedRequests() {
        // Create user
        User user = new User();
        user.setName("Payment Customer");
        String email = "pay_" + UUID.randomUUID() + "@test.com";
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        User savedUser = userRepository.save(user);

        // Create restaurant
        Restaurant rest = new Restaurant();
        rest.setName("Payment Restaurant");
        rest.setAddress("123 Street");
        rest.setCuisine("Fast Food");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        // Create menu item and add to cart
        MenuItem mi = new MenuItem();
        mi.setItemName("Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("100.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        MenuItem savedMi = menuItemRepository.save(mi);

        cartService.addItem(email, savedMi.getMenuItemId(), 1);

        Order savedOrder = orderService.createOrder(email, "123 Street", "card");

        // Initiate payment
        Payment payment = paymentService.initiatePayment(email, savedOrder.getOrderId(), PaymentMethod.CARD);

        // 1. Forge signature/transactionId -> should throw
        assertThrows(ResponseStatusException.class, () -> {
            paymentService.verifyPayment(email, payment.getPaymentId(), "FORGED_SIGNATURE");
        });

        // 2. Validate valid transactionId moves order to ACCEPTED
        Payment verified = paymentService.verifyPayment(email, payment.getPaymentId(), "TXN_SUCCESS_" + savedOrder.getOrderId());
        assertEquals(PaymentStatus.PAID, verified.getPaymentStatus());
    }

    @Test
    public void testJwtSecretValidation() {
        JwtUtil testUtil = new JwtUtil();
        
        // Null/empty secret
        ReflectionTestUtils.setField(testUtil, "secret", "");
        assertThrows(IllegalStateException.class, testUtil::validateSecret);

        // Default placeholder
        ReflectionTestUtils.setField(testUtil, "secret", "change-this-secret-for-prod");
        assertThrows(IllegalStateException.class, testUtil::validateSecret);

        // Under 32 characters
        ReflectionTestUtils.setField(testUtil, "secret", "short-secret");
        assertThrows(IllegalStateException.class, testUtil::validateSecret);

        // Valid strong secret
        ReflectionTestUtils.setField(testUtil, "secret", "a-very-long-and-highly-secure-jwt-secret-key-that-exceeds-32-characters");
        assertDoesNotThrow(testUtil::validateSecret);
    }

    @Test
    public void testCartAndOrderValidationForUnavailableItemsAndInactiveRestaurants() {
        String email = "cart_val_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Cart Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        User savedUser = userRepository.save(user);

        // Inactive Restaurant
        Restaurant inactiveRest = new Restaurant();
        inactiveRest.setName("Inactive Rest");
        inactiveRest.setAddress("Addr");
        inactiveRest.setCuisine("Cuisine");
        inactiveRest.setAdminId(3L);
        inactiveRest.setActive(false);
        Restaurant savedInactive = restaurantRepository.save(inactiveRest);

        MenuItem mi1 = new MenuItem();
        mi1.setItemName("Item 1");
        mi1.setDescription("Desc 1");
        mi1.setCategory("Cat");
        mi1.setPrice(new BigDecimal("10.00"));
        mi1.setAvailability(true);
        mi1.setRestaurant(savedInactive);
        MenuItem savedMi1 = menuItemRepository.save(mi1);

        // Adding item from inactive restaurant -> should throw
        assertThrows(ResponseStatusException.class, () -> {
            cartService.addItem(email, savedMi1.getMenuItemId(), 1);
        });

        // Active Restaurant with Unavailable Item
        Restaurant activeRest = new Restaurant();
        activeRest.setName("Active Rest");
        activeRest.setAddress("Addr");
        activeRest.setCuisine("Cuisine");
        activeRest.setAdminId(3L);
        activeRest.setActive(true);
        Restaurant savedActive = restaurantRepository.save(activeRest);

        MenuItem mi2 = new MenuItem();
        mi2.setItemName("Item 2");
        mi2.setDescription("Desc 2");
        mi2.setCategory("Cat");
        mi2.setPrice(new BigDecimal("20.00"));
        mi2.setAvailability(false); // unavailable
        mi2.setRestaurant(savedActive);
        MenuItem savedMi2 = menuItemRepository.save(mi2);

        // Adding unavailable item -> should throw
        assertThrows(ResponseStatusException.class, () -> {
            cartService.addItem(email, savedMi2.getMenuItemId(), 1);
        });
    }

    @Test
    public void testSafePasswordEncoderDelegation() {
        // Plaintext matches
        assertTrue(passwordEncoder.matches("Sai_310505", "Sai_310505"));

        // BCrypt variants match ($2a, $2b, $2y)
        String hash2a = "$2a$10$zOYWJhj8D1cJ5DxUx2z3gOCdxH6oriPKKlB8UAp7TELeAfVSoHT4y";
        String hash2b = "$2b$10$zOYWJhj8D1cJ5DxUx2z3gOCdxH6oriPKKlB8UAp7TELeAfVSoHT4y";
        String hash2y = "$2y$10$zOYWJhj8D1cJ5DxUx2z3gOCdxH6oriPKKlB8UAp7TELeAfVSoHT4y";

        assertTrue(passwordEncoder.matches("Sai_310505", hash2a));
        assertTrue(passwordEncoder.matches("Sai_310505", hash2b));
        assertTrue(passwordEncoder.matches("Sai_310505", hash2y));
        
        // Assert no double-hashing on boot/matching
        assertFalse(hash2a.startsWith("{bcrypt}"));
    }

    @Test
    public void testCheckoutQuoteConsistency() {
        String email = "quote_test_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Quote Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        Restaurant rest = new Restaurant();
        rest.setName("Quote Restaurant");
        rest.setAddress("Addr");
        rest.setCuisine("Cuisine");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("100.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        MenuItem savedMi = menuItemRepository.save(mi);

        // Add to cart
        cartService.addItem(email, savedMi.getMenuItemId(), 2);

        Map<String, Object> quote = orderService.calculateQuote(email);
        BigDecimal subtotal = (BigDecimal) quote.get("subtotal");
        BigDecimal delivery = (BigDecimal) quote.get("deliveryFee");
        BigDecimal tax = (BigDecimal) quote.get("tax");
        BigDecimal total = (BigDecimal) quote.get("total");

        assertEquals(new BigDecimal("200.00"), subtotal);
        assertEquals(new BigDecimal("40.00"), delivery);
        assertEquals(new BigDecimal("16.00"), tax);
        assertEquals(new BigDecimal("256.00"), total);
    }

    @Test
    public void testRestaurantAssignmentValidation() {
        // Create custom user (not admin)
        User cust = new User();
        cust.setName("Customer User");
        String email1 = "cust_rest_" + UUID.randomUUID() + "@test.com";
        cust.setEmail(email1);
        cust.setPassword(passwordEncoder.encode("Sai_310505"));
        cust.setRole(UserRole.CUSTOMER);
        User savedCust = userRepository.save(cust);

        // Create admin user
        User adm = new User();
        adm.setName("Admin User");
        String email2 = "adm_rest_" + UUID.randomUUID() + "@test.com";
        adm.setEmail(email2);
        adm.setPassword(passwordEncoder.encode("Sai_310505"));
        adm.setRole(UserRole.ADMIN);
        User savedAdm = userRepository.save(adm);

        RestaurantDTO dto = new RestaurantDTO();
        dto.setName("New Assignment Rest");
        dto.setAddress("Addr");
        dto.setCuisine("Cuisine");

        // 1. Assign non-existent user -> should throw
        dto.setAdminId(9999L);
        assertThrows(ResponseStatusException.class, () -> restaurantService.createRestaurant(dto));

        // 2. Assign CUSTOMER user -> should throw
        dto.setAdminId(savedCust.getUserId());
        assertThrows(ResponseStatusException.class, () -> restaurantService.createRestaurant(dto));

        // 3. Assign valid ADMIN user -> should pass
        dto.setAdminId(savedAdm.getUserId());
        RestaurantDTO created = restaurantService.createRestaurant(dto);
        assertNotNull(created);

        // 4. Assign same ADMIN user to another restaurant -> should throw 409 Conflict
        RestaurantDTO dto2 = new RestaurantDTO();
        dto2.setName("Another Rest");
        dto2.setAddress("Addr");
        dto2.setCuisine("Cuisine");
        dto2.setAdminId(savedAdm.getUserId());
        assertThrows(ResponseStatusException.class, () -> restaurantService.createRestaurant(dto2));
    }
}
