-- Add tip QR code fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alipay_qr TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wechat_qr TEXT;
