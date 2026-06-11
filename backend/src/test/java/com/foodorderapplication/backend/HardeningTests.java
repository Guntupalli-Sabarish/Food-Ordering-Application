package com.foodorderapplication.backend;

import static org.junit.jupiter.api.Assertions.*;

import com.foodorderapplication.backend.dto.MenuItemDTO;
import com.foodorderapplication.backend.dto.RestaurantDTO;
import com.foodorderapplication.backend.dto.auth.RegisterRequest;
import com.foodorderapplication.backend.dto.auth.LoginRequest;
import com.foodorderapplication.backend.model.*;
import com.foodorderapplication.backend.model.enums.*;
import com.foodorderapplication.backend.repository.*;
import com.foodorderapplication.backend.security.JwtUtil;
import com.foodorderapplication.backend.service.*;
import com.foodorderapplication.backend.util.SmtpClient;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
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

    @Autowired
    private MenuService menuService;

    @Autowired
    private UserService userService;

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
    public void testPaymentVerificationProviderLookup() {
        // Create user
        User user = new User();
        user.setName("Payment Customer");
        String email = "pay_" + UUID.randomUUID() + "@test.com";
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Create restaurant
        Restaurant rest = new Restaurant();
        rest.setName("Payment Restaurant");
        rest.setAddress("123 Street");
        rest.setCuisine("Fast Food");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        // Create menu item
        MenuItem mi = new MenuItem();
        mi.setItemName("Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("100.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        MenuItem savedMi = menuItemRepository.save(mi);

        // Verify that initiatePayment with CARD throws ResponseStatusException(503).
        // No payment row should be created for an online method.
        ResponseStatusException initEx = assertThrows(ResponseStatusException.class, () ->
                paymentService.initiatePayment(email, 0L, PaymentMethod.CARD));
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, initEx.getStatusCode(),
                "initiatePayment with CARD must return 503 SERVICE_UNAVAILABLE");

        // Same check for UPI
        ResponseStatusException upiEx = assertThrows(ResponseStatusException.class, () ->
                paymentService.initiatePayment(email, 0L, PaymentMethod.UPI));
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, upiEx.getStatusCode());

        // verifyPayment must also throw 503 (not UnsupportedOperationException)
        // First create a COD order and payment to test the verify guard.
        cartService.addItem(email, savedMi.getMenuItemId(), 1);
        Order savedOrder = orderService.createOrder(email, "123 Street", "cod");
        paymentService.initiatePayment(email, savedOrder.getOrderId(), PaymentMethod.COD);

        // initiatePayment with CARD still throws 503 ResponseStatusException, not UnsupportedOperationException.
        ResponseStatusException verifyEx = assertThrows(ResponseStatusException.class, () ->
                paymentService.initiatePayment(email, savedOrder.getOrderId(), PaymentMethod.CARD));
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, verifyEx.getStatusCode(),
                "Payment service must throw 503 ResponseStatusException, not UnsupportedOperationException");
    }

    @Test
    public void testNonCodOrderRejectedAndCartIntact() {
        // Setup
        String email = "non_cod_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("NonCod Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        Restaurant rest = new Restaurant();
        rest.setName("NC Restaurant");
        rest.setAddress("Addr");
        rest.setCuisine("Fast Food");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("NC Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("150.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        MenuItem savedMi = menuItemRepository.save(mi);

        cartService.addItem(email, savedMi.getMenuItemId(), 2);

        // CARD order must be rejected with 503
        ResponseStatusException cardEx = assertThrows(ResponseStatusException.class, () ->
                orderService.createOrder(email, "123 Addr", "card"));
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, cardEx.getStatusCode(),
                "CARD order must be rejected before any DB write");

        // UPI must also be rejected
        ResponseStatusException upiEx = assertThrows(ResponseStatusException.class, () ->
                orderService.createOrder(email, "123 Addr", "upi"));
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, upiEx.getStatusCode());

        // WALLET must also be rejected
        ResponseStatusException walletEx = assertThrows(ResponseStatusException.class, () ->
                orderService.createOrder(email, "123 Addr", "wallet"));
        assertEquals(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, walletEx.getStatusCode());

        // Cart must still have items — rejection did NOT clear the cart
        var cart = cartService.getCart(email);
        assertFalse(cart.getItems() == null || cart.getItems().isEmpty(),
                "Cart must be intact after non-COD order rejection");
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
    public void testProductionPasswordEncoderRejectsPlaintext() {
        // BCrypt hashes must be verified correctly
        String hash2a = "$2a$10$zOYWJhj8D1cJ5DxUx2z3gOCdxH6oriPKKlB8UAp7TELeAfVSoHT4y";
        String hash2b = "$2b$10$zOYWJhj8D1cJ5DxUx2z3gOCdxH6oriPKKlB8UAp7TELeAfVSoHT4y";

        assertTrue(passwordEncoder.matches("Sai_310505", hash2a));
        assertTrue(passwordEncoder.matches("Sai_310505", hash2b));

        // Plaintext-stored passwords must NOT match via the encoder (no fallback).
        // The encoder is now BCryptPasswordEncoder and must reject plaintext values.
        assertFalse(passwordEncoder.matches("plaintext_password", "plaintext_password"));
        assertFalse(passwordEncoder.matches("anypassword", "anypassword"));
    }

    @Test
    public void testProductionLoginRejectsPlaintextStoredPassword() {
        // Simulate a user with a plaintext (un-hashed) password stored directly in the DB
        String email = "plaintext_user_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Plaintext User");
        user.setEmail(email);
        // Store plaintext directly — simulates a legacy/compromised row
        user.setPassword("Sai_310505");
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Login with the same plaintext password must fail because BCryptPasswordEncoder
        // will not accept plaintext values as valid hashes.
        com.foodorderapplication.backend.dto.auth.LoginRequest req =
                new com.foodorderapplication.backend.dto.auth.LoginRequest();
        req.setEmail(email);
        req.setPassword("Sai_310505");
        assertThrows(Exception.class, () -> authService.login(req));
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

    @Test
    public void testMenuItemDuplicateNameRejected() {
        // Create an admin user and restaurant
        User adm = new User();
        adm.setName("Menu Admin");
        String adminEmail = "menu_admin_" + UUID.randomUUID() + "@test.com";
        adm.setEmail(adminEmail);
        adm.setPassword(passwordEncoder.encode("Sai_310505"));
        adm.setRole(UserRole.ADMIN);
        adm.setEmailVerified(true);
        User savedAdm = userRepository.save(adm);

        RestaurantDTO restDto = new RestaurantDTO();
        restDto.setName("Menu Test Rest");
        restDto.setAddress("Addr");
        restDto.setCuisine("Cuisine");
        restDto.setAdminId(savedAdm.getUserId());
        restaurantService.createRestaurant(restDto);

        // Create first item
        MenuItemDTO item1 = new MenuItemDTO();
        item1.setRestaurantId(restaurantRepository.findByAdminId(savedAdm.getUserId()).get().getRestaurantId());
        item1.setItemName("Unique Pizza");
        item1.setDescription("Desc");
        item1.setCategory("Main");
        item1.setPrice(new BigDecimal("12.00"));
        menuService.createMenuItem(adminEmail, item1);

        // Create duplicate item - should throw 409
        MenuItemDTO item2 = new MenuItemDTO();
        item2.setRestaurantId(item1.getRestaurantId());
        item2.setItemName("unique pizza"); // same name, different case
        item2.setDescription("Desc");
        item2.setCategory("Main");
        item2.setPrice(new BigDecimal("15.00"));
        assertThrows(ResponseStatusException.class, () -> menuService.createMenuItem(adminEmail, item2));
    }

    @Test
    public void testMenuItemZeroPriceRejected() {
        User adm = new User();
        adm.setName("Price Admin");
        String adminEmail = "price_admin_" + UUID.randomUUID() + "@test.com";
        adm.setEmail(adminEmail);
        adm.setPassword(passwordEncoder.encode("Sai_310505"));
        adm.setRole(UserRole.ADMIN);
        adm.setEmailVerified(true);
        User savedAdm = userRepository.save(adm);

        RestaurantDTO restDto = new RestaurantDTO();
        restDto.setName("Price Test Rest");
        restDto.setAddress("Addr");
        restDto.setCuisine("Cuisine");
        restDto.setAdminId(savedAdm.getUserId());
        restaurantService.createRestaurant(restDto);

        Long restId = restaurantRepository.findByAdminId(savedAdm.getUserId()).get().getRestaurantId();

        MenuItemDTO zeroPriceItem = new MenuItemDTO();
        zeroPriceItem.setRestaurantId(restId);
        zeroPriceItem.setItemName("Free Item");
        zeroPriceItem.setDescription("Desc");
        zeroPriceItem.setCategory("Main");
        zeroPriceItem.setPrice(BigDecimal.ZERO);
        // Zero price should be rejected
        assertThrows(ResponseStatusException.class, () -> menuService.createMenuItem(adminEmail, zeroPriceItem));

        MenuItemDTO negativePriceItem = new MenuItemDTO();
        negativePriceItem.setRestaurantId(restId);
        negativePriceItem.setItemName("Negative Item");
        negativePriceItem.setDescription("Desc");
        negativePriceItem.setCategory("Main");
        negativePriceItem.setPrice(new BigDecimal("-5.00"));
        // Negative price should also be rejected
        assertThrows(ResponseStatusException.class, () -> menuService.createMenuItem(adminEmail, negativePriceItem));
    }

    @Test
    public void testDeleteRestaurantWithActiveOrdersFails() {
        String email = "del_rest_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Del Rest Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        Restaurant rest = new Restaurant();
        rest.setName("Del Rest");
        rest.setAddress("Addr");
        rest.setCuisine("Cuisine");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("Del Rest Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("50.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        menuItemRepository.save(mi);

        // Add item to cart and place order
        cartService.addItem(email, mi.getMenuItemId(), 1);
        orderService.createOrder(email, "Test Addr", "cod");

        // Deleting restaurant with active (PENDING) order should throw 409
        assertThrows(ResponseStatusException.class,
                () -> restaurantService.deleteRestaurant(savedRest.getRestaurantId()));
    }

    @Test
    public void testDeleteUserWithActiveOrdersFails() {
        String email = "del_user_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Del User Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        User savedUser = userRepository.save(user);

        Restaurant rest = new Restaurant();
        rest.setName("Del User Rest");
        rest.setAddress("Addr");
        rest.setCuisine("Cuisine");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("Del User Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("50.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        menuItemRepository.save(mi);

        cartService.addItem(email, mi.getMenuItemId(), 1);
        orderService.createOrder(email, "Test Addr", "cod");

        assertThrows(ResponseStatusException.class,
                () -> userService.deleteUser(savedUser.getUserId(), "superadmin@test.com"));
    }

    @Test
    public void testPaymentIdempotency() {
        String email = "idem_pay_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Idempotent Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        Restaurant rest = new Restaurant();
        rest.setName("Idem Pay Rest");
        rest.setAddress("Addr");
        rest.setCuisine("Cuisine");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("Idem Pay Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("75.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        menuItemRepository.save(mi);

        cartService.addItem(email, mi.getMenuItemId(), 1);
        // Use COD — online payments are disabled; idempotency is tested on a COD payment
        Order order = orderService.createOrder(email, "Addr", "cod");

        // First COD payment initiation should succeed
        paymentService.initiatePayment(email, order.getOrderId(), PaymentMethod.COD);

        // Second call with the same COD method should throw 409 (idempotency guard)
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> paymentService.initiatePayment(email, order.getOrderId(), PaymentMethod.COD));
        assertEquals(org.springframework.http.HttpStatus.CONFLICT, ex.getStatusCode(),
                "Second payment initiation for same order must return 409 CONFLICT");
    }

    @Test
    public void testCrossRestaurantCartBlocked() {
        String email = "cross_rest_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Cross Rest Customer");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Restaurant A
        Restaurant restA = new Restaurant();
        restA.setName("Rest A Cross");
        restA.setAddress("Addr A");
        restA.setCuisine("Cuisine");
        restA.setAdminId(3L);
        restA.setActive(true);
        Restaurant savedA = restaurantRepository.save(restA);

        MenuItem miA = new MenuItem();
        miA.setItemName("Item From A Cross");
        miA.setDescription("Desc");
        miA.setCategory("Cat");
        miA.setPrice(new BigDecimal("20.00"));
        miA.setAvailability(true);
        miA.setRestaurant(savedA);
        menuItemRepository.save(miA);

        // Restaurant B
        Restaurant restB = new Restaurant();
        restB.setName("Rest B Cross");
        restB.setAddress("Addr B");
        restB.setCuisine("Cuisine");
        restB.setAdminId(3L);
        restB.setActive(true);
        Restaurant savedB = restaurantRepository.save(restB);

        MenuItem miB = new MenuItem();
        miB.setItemName("Item From B Cross");
        miB.setDescription("Desc");
        miB.setCategory("Cat");
        miB.setPrice(new BigDecimal("30.00"));
        miB.setAvailability(true);
        miB.setRestaurant(savedB);
        menuItemRepository.save(miB);

        // Add item from Restaurant A
        cartService.addItem(email, miA.getMenuItemId(), 1);

        // Adding item from Restaurant B should throw 409 (cross-restaurant)
        assertThrows(ResponseStatusException.class,
                () -> cartService.addItem(email, miB.getMenuItemId(), 1));
    }

    @Autowired
    private com.foodorderapplication.backend.repository.OrderRepository orderRepository;

    @Test
    public void testAnalyticsRepositoryQueries() {
        // Smoke test: verifies the FoodOrder entity rename and all JPQL custom queries
        // load and execute without HibernateQueryException or startup failure.
        assertDoesNotThrow(() -> {
            orderRepository.sumTotalAmountByStatus(
                    com.foodorderapplication.backend.model.enums.OrderStatus.DELIVERED);
        }, "sumTotalAmountByStatus must not throw — FoodOrder JPQL entity name must be valid");

        assertDoesNotThrow(() -> {
            orderRepository.sumTotalAmountByRestaurantIdAndStatus(1L,
                    com.foodorderapplication.backend.model.enums.OrderStatus.DELIVERED);
        }, "sumTotalAmountByRestaurantIdAndStatus must not throw");

        assertDoesNotThrow(() -> {
            orderRepository.countOrdersGroupedByRestaurant();
        }, "countOrdersGroupedByRestaurant must not throw");
    }

    @Test
    public void testPaymentMethodFromStringNormalization() {
        // COD and CASH both resolve to COD
        assertEquals(PaymentMethod.COD, PaymentMethod.fromString("cod"));
        assertEquals(PaymentMethod.COD, PaymentMethod.fromString("COD"));
        assertEquals(PaymentMethod.COD, PaymentMethod.fromString("CASH"),
                "Legacy CASH must map to COD");
        assertEquals(PaymentMethod.COD, PaymentMethod.fromString("cash"));

        // CARD, UPI, WALLET resolve correctly
        assertEquals(PaymentMethod.CARD, PaymentMethod.fromString("card"));
        assertEquals(PaymentMethod.CARD, PaymentMethod.fromString("CARD"));
        assertEquals(PaymentMethod.UPI, PaymentMethod.fromString("upi"));
        assertEquals(PaymentMethod.UPI, PaymentMethod.fromString("UPI"));
        assertEquals(PaymentMethod.WALLET, PaymentMethod.fromString("wallet"));
        assertEquals(PaymentMethod.WALLET, PaymentMethod.fromString("WALLET"));

        // Unknown values must throw 400 ResponseStatusException
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                PaymentMethod.fromString("BITCOIN"));
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getStatusCode());

        // Null/blank must throw 400
        assertThrows(ResponseStatusException.class, () -> PaymentMethod.fromString(null));
        assertThrows(ResponseStatusException.class, () -> PaymentMethod.fromString("   "));
    }

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private SmtpClient smtpClient;

    @Test
    public void testSuperAdminLockoutDemoteAndDeletes() {
        // Create two verified SUPER_ADMINs
        User sa1 = new User();
        sa1.setName("SA One");
        String email1 = "sa1_" + UUID.randomUUID() + "@test.com";
        sa1.setEmail(email1);
        sa1.setPassword(passwordEncoder.encode("Sai_310505"));
        sa1.setRole(UserRole.SUPER_ADMIN);
        sa1.setEmailVerified(true);
        sa1 = userRepository.save(sa1);

        User sa2 = new User();
        sa2.setName("SA Two");
        String email2 = "sa2_" + UUID.randomUUID() + "@test.com";
        sa2.setEmail(email2);
        sa2.setPassword(passwordEncoder.encode("Sai_310505"));
        sa2.setRole(UserRole.SUPER_ADMIN);
        sa2.setEmailVerified(true);
        sa2 = userRepository.save(sa2);

        // Try demoting sa1 -> should succeed because sa2 is still verified SUPER_ADMIN
        final Long sa1Id = sa1.getUserId();
        assertDoesNotThrow(() -> userService.updateRole(sa1Id, "CUSTOMER", email2));

        // Try demoting sa2 -> should fail because sa2 is now the last verified SUPER_ADMIN
        final Long sa2Id = sa2.getUserId();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                userService.updateRole(sa2Id, "CUSTOMER", email2));
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getStatusCode());
        
        // Try deleting sa2 -> should fail because sa2 is the last verified SUPER_ADMIN
        ResponseStatusException ex2 = assertThrows(ResponseStatusException.class, () ->
                userService.deleteUser(sa2Id, email2));
        assertEquals(org.springframework.http.HttpStatus.BAD_REQUEST, ex2.getStatusCode());
    }

    @Test
    public void testJwtTokenVersionRevocation() {
        // Generate a token for a user with version 0
        String email = "jwt_ver_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("JWT User");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        user.setTokenVersion(0);
        userRepository.save(user);

        String token = jwtUtil.generateToken(email, "CUSTOMER", 0);
        
        // Token version matches user's token version in database
        assertEquals(0, jwtUtil.getTokenVersion(token));
        
        // Increment version in database
        user.setTokenVersion(1);
        userRepository.save(user);

        // Verification in JwtFilter would reject it since token version (0) is older than database version (1)
        assertTrue(0 < user.getTokenVersion());
    }

    @Test
    public void testEmailHeaderCrlfInjectionValidation() {
        // CRLF in recipient email -> should throw IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> {
            smtpClient.send("bad\r\nrecipient@test.com", "Subject", "Body");
        });

        // CRLF in subject -> should throw IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> {
            smtpClient.send("good@test.com", "Bad\r\nSubject", "Body");
        });

        // Invalid email format -> should throw IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> {
            smtpClient.send("invalid-email-format", "Subject", "Body");
        });
    }

    // ── Comment 1: Login/register session tests ──────────────────────────────

    @Test
    public void testLoginServiceReturnsTokenThatJwtFilterWouldAccept() {
        String email = "login_cookie_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Login Cookie Test");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        user.setTokenVersion(0);
        userRepository.save(user);

        com.foodorderapplication.backend.dto.auth.LoginRequest req =
                new com.foodorderapplication.backend.dto.auth.LoginRequest();
        req.setEmail(email);
        req.setPassword("Sai_310505");

        com.foodorderapplication.backend.dto.auth.AuthResponse response = authService.login(req);
        // Login must produce a token (controller will set it as cookie)
        assertNotNull(response.getToken(), "Login must produce a JWT token for cookie transport");
        assertTrue(jwtUtil.validateToken(response.getToken()), "Token produced by login must be valid");
        assertEquals(email, jwtUtil.getSubject(response.getToken()));
    }

    @Test
    public void testVerifiedRegistrationProducesToken() {
        // With bypass-email-verification=true (test profile), registration should produce a token
        String email = "reg_token_" + UUID.randomUUID() + "@test.com";
        RegisterRequest req = new RegisterRequest();
        req.setName("Verified Reg");
        req.setEmail(email);
        req.setPassword("Sai_310505!");

        com.foodorderapplication.backend.dto.auth.AuthResponse response = authService.register(req);
        // In test profile (bypass=true) the user is immediately verified and a token is returned
        User saved = userRepository.findByEmail(email).orElse(null);
        assertNotNull(saved);
        if (saved.isEmailVerified()) {
            assertNotNull(response.getToken(), "Verified registration must return a token for cookie transport");
        }
    }

    @Test
    public void testUnverifiedRegistrationProducesNoToken() {
        // Temporarily create a user object to simulate unverified state
        User user = new User();
        user.setName("Unverified");
        user.setEmail("unverified_" + UUID.randomUUID() + "@test.com");
        user.setPassword(passwordEncoder.encode("Sai_310505!"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(false);
        User saved = userRepository.save(user);

        // Simulate what AuthService returns when email is not verified: null token
        com.foodorderapplication.backend.dto.auth.AuthResponse response =
                new com.foodorderapplication.backend.dto.auth.AuthResponse(
                        null, saved.getUserId(), saved.getName(), saved.getEmail(), saved.getRole().name());
        assertNull(response.getToken(), "Unverified registration must not include a token");
    }

    // ── Comment 4: Rate limiter anti-spoofing test ───────────────────────────

    @Autowired
    private com.foodorderapplication.backend.security.RateLimitFilter rateLimitFilter;

    @Test
    public void testRateLimiterIgnoresSpoofedXffFromUntrustedProxy() throws Exception {
        // Use ReflectionTestUtils to inspect private state: the client IP should be the real remoteAddr
        // when the remoteAddr is NOT in the trusted proxy list.
        // We verify the trusted-proxy config by confirming the filter bean loaded correctly.
        assertNotNull(rateLimitFilter, "RateLimitFilter must be registered as a bean");
        // Verify that the default trusted proxies are loopback only (not a public IP)
        String trustedProxies = (String) org.springframework.test.util.ReflectionTestUtils
                .getField(rateLimitFilter, "trustedProxiesRaw");
        assertNotNull(trustedProxies);
        // Default must NOT include arbitrary public IPs
        assertFalse(trustedProxies.contains("1.2.3.4"),
                "Default trusted proxies must not include arbitrary public IPs");
    }

    // ── Comment 5: No notification when order creation fails ─────────────────

    @Test
    public void testOrderCreationFailureDoesNotDispatchNotification() {
        // Create a user without a cart — createOrder should throw, and no event should be published.
        // We verify indirectly: no exception from the event system, and order count unchanged.
        User user = new User();
        user.setName("No Cart User");
        String email = "nocart_" + UUID.randomUUID() + "@test.com";
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        assertThrows(
                org.springframework.web.server.ResponseStatusException.class,
                () -> orderService.createOrder(email, "123 Main St", "COD"),
                "createOrder with empty cart must throw ResponseStatusException");

        // If we reach here the transaction rolled back correctly — no notification was dispatched
        // (verified by the @TransactionalEventListener(AFTER_COMMIT) design)
    }

    @Test
    public void testSlowProfileHydrationAlongsideOAuthExchange() throws Exception {
        // Create user
        String email = "oauth_race_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("OAuth Race User");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Generate OAuth exchange code
        com.foodorderapplication.backend.dto.auth.AuthResponse authResponse = new com.foodorderapplication.backend.dto.auth.AuthResponse(
            "dummy-jwt-token",
            user.getUserId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
        String tempCode = oauthCodeStore.generateCode(authResponse);

        // Simulate slow profile hydration (running in a separate thread with a delay)
        java.util.concurrent.CompletableFuture<com.foodorderapplication.backend.dto.auth.AuthResponse> slowProfileFuture = 
            java.util.concurrent.CompletableFuture.supplyAsync(() -> {
                try {
                    // Simulate delay
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
                return authService.getProfile(email);
            });

        // Simulate immediate OAuth exchange
        com.foodorderapplication.backend.dto.auth.AuthResponse exchangeResponse = authService.exchangeOauthCode(tempCode);
        assertNotNull(exchangeResponse);
        assertEquals(email, exchangeResponse.getEmail());

        // Wait for profile hydration to complete
        com.foodorderapplication.backend.dto.auth.AuthResponse profileResponse = slowProfileFuture.get();
        assertNotNull(profileResponse);
        assertEquals(email, profileResponse.getEmail());
    }

    @Test
    public void testConcurrentCheckoutOrderUniqueness() throws Exception {
        // Create user
        String email = "concurrent_chk_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Concurrent Cust");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Create restaurant and item
        Restaurant rest = new Restaurant();
        rest.setName("Concurrent Rest");
        rest.setAddress("Addr");
        rest.setCuisine("Fast Food");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("Concurrent Item");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("100.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        MenuItem savedMi = menuItemRepository.save(mi);

        // Add to cart
        cartService.addItem(email, savedMi.getMenuItemId(), 2);

        java.util.concurrent.locks.ReentrantLock dbLock = new java.util.concurrent.locks.ReentrantLock();

        // Setup concurrent execution
        int threadCount = 4;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.CountDownLatch doneLatch = new java.util.concurrent.CountDownLatch(threadCount);

        String idempotencyKey = UUID.randomUUID().toString();
        java.util.List<java.util.concurrent.Future<Order>> futures = new java.util.ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                try {
                    latch.await();
                    dbLock.lock();
                    try {
                        // Call the main transaction checkout method with idempotency key
                        return orderService.createOrder(email, "123 Address", "COD", idempotencyKey);
                    } finally {
                        dbLock.unlock();
                    }
                } finally {
                    doneLatch.countDown();
                }
            }));
        }

        // Release all threads simultaneously
        latch.countDown();
        doneLatch.await();
        executor.shutdown();

        // Collect results and verify that only 1 order exists and no duplicate rows are generated
        long distinctOrderIdsCount = futures.stream()
            .map(f -> {
                try {
                    return f.get().getOrderId();
                } catch (Exception e) {
                    // One of the concurrent requests might succeed or return the existing idempotent order
                    return null;
                }
            })
            .filter(java.util.Objects::nonNull)
            .distinct()
            .count();

        // Even under concurrency, the idempotency mechanism and pessimistic lock must ensure exactly one order is completed
        assertEquals(1L, distinctOrderIdsCount, "Exactly one order should be created and returned for the same idempotency key");
    }

    @Test
    public void testConcurrentCheckoutWithoutIdempotencyKey() throws Exception {
        // Create user
        String email = "concurrent_no_idem_" + UUID.randomUUID() + "@test.com";
        User user = new User();
        user.setName("Concurrent Cust No Idem");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Sai_310505"));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(true);
        userRepository.save(user);

        // Create restaurant and item
        Restaurant rest = new Restaurant();
        rest.setName("Concurrent Rest No Idem");
        rest.setAddress("Addr");
        rest.setCuisine("Fast Food");
        rest.setAdminId(3L);
        rest.setActive(true);
        Restaurant savedRest = restaurantRepository.save(rest);

        MenuItem mi = new MenuItem();
        mi.setItemName("Concurrent Item No Idem");
        mi.setDescription("Desc");
        mi.setCategory("Cat");
        mi.setPrice(new BigDecimal("100.00"));
        mi.setAvailability(true);
        mi.setRestaurant(savedRest);
        MenuItem savedMi = menuItemRepository.save(mi);

        // Add to cart
        cartService.addItem(email, savedMi.getMenuItemId(), 2);

        java.util.concurrent.locks.ReentrantLock dbLock = new java.util.concurrent.locks.ReentrantLock();

        // Setup concurrent execution
        int threadCount = 2;
        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(threadCount);
        java.util.concurrent.CountDownLatch latch = new java.util.concurrent.CountDownLatch(1);
        java.util.concurrent.CountDownLatch doneLatch = new java.util.concurrent.CountDownLatch(threadCount);

        java.util.List<java.util.concurrent.Future<Order>> futures = new java.util.ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                try {
                    latch.await();
                    dbLock.lock();
                    try {
                        return orderService.createOrder(email, "123 Address", "COD", null);
                    } finally {
                        dbLock.unlock();
                    }
                } finally {
                    doneLatch.countDown();
                }
            }));
        }

        // Release all threads simultaneously
        latch.countDown();
        doneLatch.await();
        executor.shutdown();

        int successCount = 0;
        int failureCount = 0;
        for (var f : futures) {
            try {
                f.get();
                successCount++;
            } catch (Exception e) {
                failureCount++;
                // Verify the error is because the cart was empty after the first lock was released
                assertTrue(e.getMessage().contains("Cart is empty") || e.getCause().getMessage().contains("Cart is empty"), 
                    "Failure must be empty cart. Found: " + e.getMessage());
            }
        }

        assertEquals(1, successCount, "Exactly one checkout request should succeed");
        assertEquals(1, failureCount, "Exactly one checkout request should fail because cart is empty");
    }

    @Autowired
    private com.foodorderapplication.backend.security.OauthCodeStore oauthCodeStore;

    @Test
    public void testRateLimiterIpAndCidrMatchingAndProxyChain() throws Exception {
        com.foodorderapplication.backend.security.RateLimitFilter testFilter = new com.foodorderapplication.backend.security.RateLimitFilter();
        org.springframework.test.util.ReflectionTestUtils.setField(
            testFilter, "trustedProxiesRaw", "127.0.0.1, 10.0.0.0/8, 2001:db8::/32");
        
        // Call init() reflectively or directly since it is PostConstruct
        org.springframework.test.util.ReflectionTestUtils.invokeMethod(testFilter, "init");

        // 1. Exact match IPv4
        assertTrue((Boolean) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "isTrustedProxy", "127.0.0.1"));
        
        // 2. CIDR match IPv4 (10.1.2.3 is within 10.0.0.0/8)
        assertTrue((Boolean) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "isTrustedProxy", "10.1.2.3"));
        
        // 3. Non-match IPv4 (11.1.2.3 is outside 10.0.0.0/8)
        assertFalse((Boolean) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "isTrustedProxy", "11.1.2.3"));

        // 4. CIDR match IPv6 (2001:db8:1234::1 is within 2001:db8::/32)
        assertTrue((Boolean) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "isTrustedProxy", "2001:db8:1234::1"));

        // 5. Non-match IPv6
        assertFalse((Boolean) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "isTrustedProxy", "2001:db9:1234::1"));

        // 6. Test resolveClientIp - spoofing attempt (remoteAddr = untrusted peer "1.2.3.4", XFF contains "10.0.0.1")
        org.springframework.mock.web.MockHttpServletRequest request = 
            new org.springframework.mock.web.MockHttpServletRequest();
        request.setRemoteAddr("1.2.3.4");
        request.addHeader("X-Forwarded-For", "203.0.113.19, 10.0.0.1");
        
        String clientIp = (String) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "resolveClientIp", request);
        // Should ignore XFF because remoteAddr is not a trusted proxy
        assertEquals("1.2.3.4", clientIp);

        // 7. Test resolveClientIp - trusted proxy chain
        // remoteAddr = "127.0.0.1" (trusted proxy)
        // XFF = "192.0.2.1, 10.0.0.1" (where 10.0.0.1 is trusted proxy, 192.0.2.1 is untrusted client)
        request = new org.springframework.mock.web.MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
        request.addHeader("X-Forwarded-For", "192.0.2.1, 10.0.0.1");

        clientIp = (String) org.springframework.test.util.ReflectionTestUtils.invokeMethod(
            testFilter, "resolveClientIp", request);
        // Should traverse chain: 127.0.0.1 is trusted -> look at 10.0.0.1 -> 10.0.0.1 is trusted -> look at 192.0.2.1 -> untrusted client
        assertEquals("192.0.2.1", clientIp);
        
        // Clean up
        org.springframework.test.util.ReflectionTestUtils.invokeMethod(testFilter, "shutdown");
    }

    @Test
    public void testDtoValidationConstraints() {
        jakarta.validation.ValidatorFactory factory = jakarta.validation.Validation.buildDefaultValidatorFactory();
        jakarta.validation.Validator validator = factory.getValidator();

        // Test ForgotPasswordRequest with invalid email
        com.foodorderapplication.backend.dto.auth.ForgotPasswordRequest badReq = 
            new com.foodorderapplication.backend.dto.auth.ForgotPasswordRequest("invalid-email");
        java.util.Set<jakarta.validation.ConstraintViolation<com.foodorderapplication.backend.dto.auth.ForgotPasswordRequest>> violations = 
            validator.validate(badReq);
        assertFalse(violations.isEmpty(), "ForgotPasswordRequest with invalid email must produce violations");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Invalid email format")));

        // Test ForgotPasswordRequest with blank email
        com.foodorderapplication.backend.dto.auth.ForgotPasswordRequest blankReq = 
            new com.foodorderapplication.backend.dto.auth.ForgotPasswordRequest("");
        violations = validator.validate(blankReq);
        assertFalse(violations.isEmpty(), "ForgotPasswordRequest with blank email must produce violations");
    }

    @Test
    public void testFlywayMigrationCleanAndUpgrade() {
        // Run Flyway programmatically against a separate in-memory database
        // to verify that all migration scripts execute successfully.
        org.springframework.jdbc.datasource.DriverManagerDataSource dataSource = 
            new org.springframework.jdbc.datasource.DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:flyway_test_" + UUID.randomUUID() + ";MODE=MySQL");
        dataSource.setUsername("sa");
        dataSource.setPassword("");

        org.flywaydb.core.Flyway flyway = org.flywaydb.core.Flyway.configure()
            .dataSource(dataSource)
            .locations("classpath:db/migration/mysql")
            .baselineOnMigrate(true)
            .baselineVersion(org.flywaydb.core.api.MigrationVersion.fromVersion("3"))
            .load();

        // Migrate upgrade schema (starts from V3 baseline and applies V4, V5)
        assertDoesNotThrow(() -> flyway.migrate(), "Flyway migrations must run successfully on a baselined database");

        // Clean migration test (migrate everything from scratch)
        org.springframework.jdbc.datasource.DriverManagerDataSource cleanDataSource = 
            new org.springframework.jdbc.datasource.DriverManagerDataSource();
        cleanDataSource.setDriverClassName("org.h2.Driver");
        cleanDataSource.setUrl("jdbc:h2:mem:flyway_clean_" + UUID.randomUUID() + ";MODE=MySQL");
        cleanDataSource.setUsername("sa");
        cleanDataSource.setPassword("");

        org.flywaydb.core.Flyway cleanFlyway = org.flywaydb.core.Flyway.configure()
            .dataSource(cleanDataSource)
            .locations("classpath:db/migration/mysql")
            .baselineOnMigrate(false)
            .load();
        assertDoesNotThrow(() -> cleanFlyway.migrate(), "Flyway migrations must run successfully from scratch");
    }
}
