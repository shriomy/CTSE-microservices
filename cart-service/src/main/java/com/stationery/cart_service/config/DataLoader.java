package com.stationery.cart_service.config;

import com.stationery.cart_service.entity.Coupon;
import com.stationery.cart_service.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final CouponRepository couponRepository;

    @Override
    public void run(String... args) throws Exception {
        if (couponRepository.count() == 0) {
            couponRepository.save(Coupon.builder()
                    .code("WELCOME10")
                    .discountPercentage(10.0)
                    .expiryDate(LocalDateTime.now().plusMonths(1))
                    .active(true)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("STUDENT25")
                    .discountPercentage(25.0)
                    .expiryDate(LocalDateTime.now().plusMonths(1))
                    .active(true)
                    .build());

            couponRepository.save(Coupon.builder()
                    .code("FREESHIP")
                    .discountPercentage(5.0) // Small discount for free ship
                    .expiryDate(LocalDateTime.now().plusMonths(1))
                    .active(true)
                    .build());
        }
    }
}
