# Gemarc Enterprises Website

A modern, responsive website for Gemarc Enterprises Incorporated - a leading provider of construction materials, equipment, and services.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Service Showcase**: Highlights three main services: Supply, Calibration & Testing, and Repair & Maintenance
- **Product Categories**: Easy navigation through different product categories
- **Professional Branding**: Consistent color scheme matching the company logo

## Services Offered

- Aggregates
- Asphalt & Bitumen
- Cement & Mortar
- Concrete & Mortar
- Drilling Machine
- Industrial Equipment
- Soil
- Steel

## Main Services

1. **Supply**: High-quality construction materials and equipment supply services
2. **Calibration & Testing**: Professional calibration and testing services for industry standards
3. **Repair & Maintenance**: Expert repair and maintenance services for construction equipment

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid)
- JavaScript (ES6+)
- Font Awesome Icons
- Responsive Design Principles

## File Structure

```
Gemarc-enterprises/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── images/
│   └── logo.svg        # Company logo
└── README.md           # This file
```

## Setup Instructions

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No additional setup required - it's a static website

## Customization

To customize the website:

1. **Colors**: Modify the CSS variables in `styles.css`
2. **Content**: Update the HTML content in `index.html`
3. **Images**: Replace images in the `images/` folder
4. **Logo**: Replace `images/logo.svg` with your company logo

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Internet Explorer 11+

## Certificate Verification System

The site now includes a no-database certificate verification workflow.

- Public verification page: `verify.html`
- Admin dashboard: `admin/index.php`
- JSON index: `data/certificates.json`
- Excel master backup: `uploads/Certificates.xlsx`

### Setup Notes

1. Run `composer install` on the hosting account or deployment environment so PhpSpreadsheet is available.
2. Replace the placeholder `AuthUserFile` path in `admin/.htaccess` with the real server path to `admin/.htpasswd`.
3. Add a valid Basic Auth user entry to `admin/.htpasswd` using the server's `htpasswd` tool.
4. Upload the latest `Certificates.xlsx` workbook through the admin dashboard.

### Verification URL

You can verify a certificate directly with a QR-ready URL like:

`https://gemarcph.com/verify.html?cert=CERT-2026-0001`

## Contact Information

For more information about Gemarc Enterprises, please contact:
- Phone: +63 909 087 9416
         +63 928 395 3532 | +63 918 905 8316
- Email: helpdesk@gemarcph.com
- Location: Marikina, Philippines

---

© 2025 Gemarc Enterprises Incorporated. All rights reserved.
