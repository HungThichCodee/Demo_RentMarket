# RentMarket

Có thể xóa Getter/Setter đi vì Lombok của tao không hoạt động
=======
#  RentMarket
---
##  Giới thiệu
**RentMarket** là một hệ thống nền tảng giúp kết nối **người cho thuê** và **người có nhu cầu thuê** (nhà, phòng trọ, căn hộ, mặt bằng kinh doanh,...).
Hệ thống được thiết kế theo hướng **Web Service (RESTful API)**, giúp:
- Quản lý thông tin người dùng
- Đăng và tìm kiếm tin cho thuê
- Hỗ trợ mở rộng thành hệ thống thương mại điện tử thuê tài sản
---
##  Mục đích dự án
RentMarket được xây dựng nhằm:
- Kết nối nhanh chóng giữa người thuê và người cho thuê
- Tối ưu trải nghiệm đăng tin và tìm kiếm
- Quản lý dữ liệu thuê một cách rõ ràng, có hệ thống
###  Định hướng phát triển
-  Thanh toán online  
-  Chat giữa người dùng  
-  Đánh giá / review  
---
##  Công nghệ sử dụng

###  Ngôn ngữ & Framework
- **Java 21**
  - Phiên bản LTS, hiệu năng cao, hỗ trợ tính năng hiện đại

- **Spring Boot 4**
  - Framework chính để xây dựng backend
  - Tích hợp:
    - Web
    - Security
    - Data JPA
---
###  Web & API
- **Spring Web MVC**
  - Xây dựng RESTful API
  - Xử lý HTTP request/response
  - Mapping endpoint bằng `@RestController`
---
###  Database & ORM
- **Spring Data JPA**
  - ORM giúp thao tác database dễ dàng
  - Tự động CRUD qua Repository
- **MySQL Connector**
  - Kết nối hệ thống với MySQL
---
###  Security
- **Spring Security**
  - Bảo mật hệ thống
  - Hiện tại sử dụng:
    - Basic Authentication (config trong `application.yaml`)
- **Spring Security OAuth2 Client**
  - Hỗ trợ mở rộng:
    - Đăng nhập Google / Facebook (future)
- **Spring Security Crypto**
  - Mã hóa mật khẩu (BCrypt, hashing)
---
###  Validation
- **Spring Validation**
  - Kiểm tra dữ liệu đầu vào:
    - `@NotNull`
    - `@Email`
    - `@Size`
---
###  Mapping & Code Generation
- **Lombok**
  - Giảm boilerplate code:
    - Getter / Setter
    - Constructor
    - Builder
- **MapStruct**
  - Mapping:
    - DTO ↔ Entity
  - Hiệu năng cao (compile-time)
---
###  Build Tool
- **Maven**
  - Quản lý dependency
  - Build project
- **Maven Wrapper (`mvnw`)**
  - Chạy project không cần cài Maven
---
###  Testing
- **Spring Boot Test**
  - Test repository, service
- **Spring Security Test**
  - Test authentication & authorization
---
###  Code Quality
- **Spotless Maven Plugin**
  - Format code tự động
  - Giữ code clean & consistent
---
###  DevOps
- **Docker**
  - Container hóa ứng dụng
- **Docker Compose**
  - Chạy nhiều service cùng lúc (mở rộng hệ thống)
---
