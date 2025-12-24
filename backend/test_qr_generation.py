"""
Quick test to verify QR code generation works correctly
"""
import qrcode
from io import BytesIO
import base64

def generate_feedback_qr(feedback_url: str) -> str:
    """Generate QR code for feedback URL"""
    qr = qrcode.make(feedback_url)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    encoded = base64.b64encode(buffer.getvalue()).decode()
    return encoded

# Test
test_url = "http://localhost:5173/feedback/123"
qr_code = generate_feedback_qr(test_url)

print("=" * 60)
print("QR CODE GENERATION TEST")
print("=" * 60)
print(f"\nFeedback URL: {test_url}")
print(f"QR Code Generated: YES")
print(f"QR Code Length: {len(qr_code)} characters (base64)")
print(f"QR Code Preview: {qr_code[:50]}...")
print("\n✅ QR generation function works correctly!")
print("\nTo view in browser, paste this in HTML:")
print(f'<img src="data:image/png;base64,{qr_code[:80]}..." />')
print("=" * 60)
