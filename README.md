# Django API E-Commerce

A small Django REST Framework backend for an e-commerce flow with a mobile-friendly JavaScript storefront. The project includes custom user signup/signin with token generation, item listing, cart management, and checkout/order placement.

## Project Structure

- `djangoapi/` - Django project settings, ASGI/WSGI entry points, and root URL routes.
- `user/` - Custom user model, signup/signin serializers, token creation, and login-required mixin.
- `items/` - Product/item model, admin registration, and public active-item listing endpoint.
- `cart/` - Cart model, serializers, and token-protected cart endpoints.
- `order/` - Checkout order model, serializers, and token-protected order endpoints.
- `frontend/` - Vanilla JavaScript storefront served by Django at `/`.
- `rest_clients/` - Sample HTTP requests for testing endpoints from the VS Code REST Client extension.
- `media/` - Local uploaded media files.

## Requirements

- Python 3.10+
- Django 4.0.x
- Django REST Framework
- Pillow, required by Django `ImageField`
- PostgreSQL server

Install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirement.txt
```

## Environment Setup

Create a local environment file from the template:

```powershell
Copy-Item .env.template .env
```

The project reads `.env` automatically from the project root. The included `.env` is suitable for local development only.

Current database settings:

```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=ecomapp_dev
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=admin123
DB_PORT=5432
```

Create the PostgreSQL database before running migrations:

```sql
CREATE DATABASE ecomapp_dev;
```

## Database Setup

Run migrations:

```powershell
python manage.py migrate
```

Create an admin user if needed:

```powershell
python manage.py createsuperuser
```

## Run the API

Start the development server:

```powershell
python manage.py runserver 8002
```

Default local URL:

```text
http://127.0.0.1:8002/
```

The storefront is available at that root URL.

## API Endpoints

| Method | Path | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/us/signup/` | Create a user and return a token | No |
| `POST` | `/api/us/signin/` | Sign in with email/password and return a new token | No |
| `GET` | `/api/it/items/` | List active items | No |
| `GET` | `/api/ca/cart/` | List cart rows for the authenticated user | `Authorization` token |
| `POST` | `/api/ca/cart/add/` | Add an item to cart | `Authorization` token |
| `PATCH` | `/api/ca/cart/update/<id>/` | Update cart row quantity | `Authorization` token |
| `DELETE` | `/api/ca/cart/delete/<id>/` | Remove a cart row | `Authorization` token |
| `GET` | `/api/or/orders/` | List orders for the authenticated user | `Authorization` token |
| `POST` | `/api/or/orders/add/` | Create an order from the authenticated user's cart | `Authorization` token |
| `POST` | `/api/ad/login/` | Minimal admin login | No |
| `GET` / `POST` | `/api/ad/items/` | Admin list/create products | Admin `Authorization` token |
| `GET` | `/api/ad/orders/` | Admin list orders | Admin `Authorization` token |
| `GET` | `/api/ad/orders/<id>/bill/` | Generate simple bill data | Admin `Authorization` token |
| `GET` / `POST` | `/api/ad/feedback/` | Admin reads feedback; visitors submit feedback | Admin token for `GET` |

Default minimal admin credentials for local development:

```text
username: appadmin
password: Admin@123
```

Authentication uses the raw token in the `Authorization` header:

```http
Authorization: your-token-value
```

Sample requests are available in `rest_clients/`.

## Notes

- This project uses a custom `user.User` model, not Django's built-in auth user model.
- Uploaded images are stored locally in `media/media/images/` based on the current `ImageField` configuration.
- Some REST client examples still reference older unregistered routes, such as wishlists.
