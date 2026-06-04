# Lỗi "Something went wrong" — React Router context bug (useNavigate ngoài BrowserRouter)

## Mức độ
**Nghiêm trọng** — crash toàn bộ giao diện, kể cả tab ẩn danh.

## Triệu chứng
- Trang web tải được nhưng ngay lập tức hiển thị **"Something went wrong — An unexpected error occurred"**.
- **Xảy ra trên mọi trình duyệt, kể cả tab ẩn danh** (khác với lỗi stale localStorage chỉ ảnh hưởng tab thường).
- Stack trace trong "Error details" có `vendor-router-***.js` ở các dòng đầu tiên.
- Server API hoàn toàn bình thường (`/health` và `/api/v1/auth/info` đều trả về 200).

## Nguyên nhân gốc rễ
Trong `web/src/main.tsx`, thứ tự lồng các React component bị sai:

```
❌ SAI:
<AuthProvider>
  <AuthGate>         ← AuthGate render <LoginPage> khi chưa đăng nhập
    <BrowserRouter>  ← BrowserRouter bắt đầu ở đây (quá muộn)
```

`LoginPage` sử dụng hook `useNavigate()` của `react-router-dom`. Hook này yêu cầu phải có `<BrowserRouter>` là component cha (ancestor) trong React tree. Khi `AuthGate` render `<LoginPage>` vì người dùng chưa đăng nhập, `BrowserRouter` chưa được mount → React Router crash với lỗi invariant → `ErrorBoundary` bắt lại và hiển thị "Something went wrong".

## Fix đã áp dụng
Đổi thứ tự trong `web/src/main.tsx` để `BrowserRouter` bao ngoài `AuthGate`:

```
✅ ĐÚNG:
<BrowserRouter>      ← BrowserRouter bắt đầu ở đây
  <AuthProvider>
    <AuthGate>       ← AuthGate render <LoginPage> (đã có Router context)
```

File đã được sửa tại: `web/src/main.tsx` (line 148-232)

## Sau khi fix
Rebuild lại image Docker:
```
docker compose -f deploy/docker-compose.yml up -d --build certctl-server
```

## Dấu hiệu nhận biết để phân biệt với lỗi stale localStorage

| Dấu hiệu | Stale localStorage | BrowserRouter bug |
|---|---|---|
| Tab ẩn danh cũng lỗi | Không | **Có** |
| Reload lại lỗi | Không | **Có** |
| Cần fix code | Không | **Có** |
| Stack trace | vendor-router ở giữa | vendor-router ở **đầu tiên** |
