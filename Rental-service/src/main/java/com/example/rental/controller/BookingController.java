package com.example.rental.controller;

import com.example.rental.dto.request.CancelBookingRequest;
import com.example.rental.dto.request.CreateBookingRequest;
import com.example.rental.dto.request.RejectBookingRequest;
import com.example.rental.dto.response.ApiResponse;
import com.example.rental.dto.response.AvailabilityResponse;
import com.example.rental.dto.response.BookingResponse;
import com.example.rental.entity.BookingStatus;
import com.example.rental.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.createBooking(request))
                .build();
    }

    @PutMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelBookingRequest request
    ) {
        String reason = (request != null) ? request.getReason() : null;
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.cancelBooking(id, reason))
                .build();
    }

    @GetMapping("/my-rentals")
    public ApiResponse<Page<BookingResponse>> getMyRentals(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<BookingResponse>>builder()
                .result(bookingService.getMyRentals(status, fromDate, toDate, page, size))
                .build();
    }

    @PutMapping("/{id}/accept")
    public ApiResponse<BookingResponse> acceptBooking(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.acceptBooking(id))
                .build();
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody RejectBookingRequest request
    ) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.rejectBooking(id, request.getReason()))
                .build();
    }

    @PutMapping("/{id}/handover")
    public ApiResponse<BookingResponse> confirmHandover(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.confirmHandover(id))
                .build();
    }

    @PutMapping("/{id}/complete")
    public ApiResponse<BookingResponse> completeBooking(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.completeBooking(id))
                .build();
    }

    @GetMapping("/my-items")
    public ApiResponse<Page<BookingResponse>> getOwnerBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<BookingResponse>>builder()
                .result(bookingService.getOwnerBookings(status, productId, fromDate, toDate, page, size))
                .build();
    }


    @GetMapping("/availability")
    public ApiResponse<AvailabilityResponse> checkAvailability(
            @RequestParam Long productId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ApiResponse.<AvailabilityResponse>builder()
                .result(bookingService.checkAvailability(productId, startDate, endDate))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> getBookingById(@PathVariable Long id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.getBookingById(id))
                .build();
    }
}
