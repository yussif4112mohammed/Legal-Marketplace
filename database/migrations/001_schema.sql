-- ============================================================
-- legal_marketplace — Full MySQL Schema
-- Run: node database/migrate.js
-- ============================================================

CREATE DATABASE IF NOT EXISTS railway
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE railway;

-- ============================================================
-- USERS (base table for all roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('client','lawyer','admin') NOT NULL DEFAULT 'client',
  first_name     VARCHAR(100) NOT NULL,
  last_name      VARCHAR(100) NOT NULL,
  phone          VARCHAR(20),
  avatar_url     VARCHAR(500),
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB;

-- ============================================================
-- SPECIALIZATIONS (lookup)
-- ============================================================
CREATE TABLE IF NOT EXISTS specializations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(10),
  is_active   TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT IGNORE INTO specializations (name, slug, icon) VALUES
  ('Real Estate Law', 'real-estate', '🏠'),
  ('Property Disputes', 'property-disputes', '⚖️'),
  ('Immigration Law', 'immigration', '🌍'),
  ('Business Law', 'business', '💼'),
  ('Family Law', 'family', '👨‍👩‍👧'),
  ('Criminal Defense', 'criminal-defense', '🛡️'),
  ('Personal Injury', 'personal-injury', '🏥'),
  ('Employment Law', 'employment', '📋'),
  ('Estate Planning', 'estate-planning', '📜'),
  ('Intellectual Property', 'ip', '💡'),
  ('Tax Law', 'tax', '🧾'),
  ('Civil Litigation', 'civil-litigation', '⚖️');

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,
  city       VARCHAR(100),
  state      CHAR(2),
  bio        TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_state (state)
) ENGINE=InnoDB;

-- ============================================================
-- LAWYERS
-- ============================================================
CREATE TABLE IF NOT EXISTS lawyers (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED NOT NULL UNIQUE,
  bar_license_number  VARCHAR(100) NOT NULL,
  bar_state           CHAR(2) NOT NULL,
  law_firm            VARCHAR(200),
  years_experience    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  bio                 TEXT,
  consultation_fee    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  city                VARCHAR(100),
  state               CHAR(2),
  website_url         VARCHAR(500),
  linkedin_url        VARCHAR(500),
  approval_status     ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  rejection_reason    TEXT,
  approved_at         DATETIME,
  approved_by         INT UNSIGNED,
  avg_rating          DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_reviews       INT UNSIGNED NOT NULL DEFAULT 0,
  total_bookings      INT UNSIGNED NOT NULL DEFAULT 0,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_approval  (approval_status),
  INDEX idx_state     (state),
  INDEX idx_rating    (avg_rating),
  INDEX idx_fee       (consultation_fee)
) ENGINE=InnoDB;

-- ============================================================
-- LAWYER <-> SPECIALIZATIONS (many-to-many)
-- ============================================================
CREATE TABLE IF NOT EXISTS lawyer_specializations (
  lawyer_id         INT UNSIGNED NOT NULL,
  specialization_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (lawyer_id, specialization_id),
  FOREIGN KEY (lawyer_id)         REFERENCES lawyers(id)         ON DELETE CASCADE,
  FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- LAWYER PRACTICE STATES
-- ============================================================
CREATE TABLE IF NOT EXISTS lawyer_practice_states (
  lawyer_id INT UNSIGNED NOT NULL,
  state     CHAR(2) NOT NULL,
  PRIMARY KEY (lawyer_id, state),
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id) ON DELETE CASCADE,
  INDEX idx_state (state)
) ENGINE=InnoDB;

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id        INT UNSIGNED NOT NULL,
  lawyer_id        INT UNSIGNED NOT NULL,
  scheduled_at     DATETIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  status           ENUM('pending','confirmed','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
  fee_charged      DECIMAL(10,2),
  notes            TEXT,
  lawyer_notes     TEXT,
  meeting_url      VARCHAR(500),
  cancelled_by     INT UNSIGNED,
  cancellation_reason TEXT,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id)    ON DELETE RESTRICT,
  FOREIGN KEY (lawyer_id) REFERENCES lawyers(id)  ON DELETE RESTRICT,
  INDEX idx_client    (client_id),
  INDEX idx_lawyer    (lawyer_id),
  INDEX idx_status    (status),
  INDEX idx_scheduled (scheduled_at)
) ENGINE=InnoDB;

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id    INT UNSIGNED NOT NULL,
  recipient_id INT UNSIGNED NOT NULL,
  content      TEXT NOT NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  read_at      DATETIME,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id)    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender    (sender_id),
  INDEX idx_recipient (recipient_id),
  INDEX idx_is_read   (is_read)
) ENGINE=InnoDB;

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id    INT UNSIGNED NOT NULL,
  lawyer_id    INT UNSIGNED NOT NULL,
  booking_id   INT UNSIGNED NOT NULL UNIQUE,
  rating       TINYINT UNSIGNED NOT NULL,
  comment      TEXT NOT NULL,
  is_visible   TINYINT(1) NOT NULL DEFAULT 1,
  moderated_by INT UNSIGNED,
  moderated_at DATETIME,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)  REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (lawyer_id)  REFERENCES lawyers(id)  ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_lawyer  (lawyer_id),
  INDEX idx_rating  (rating),
  INDEX idx_visible (is_visible),
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

-- ============================================================
-- ADMIN LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT UNSIGNED NOT NULL,
  action      VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id   INT UNSIGNED,
  details     JSON,
  ip_address  VARCHAR(45),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_admin  (admin_id),
  INDEX idx_action (action)
) ENGINE=InnoDB;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  data       JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user    (user_id),
  INDEX idx_is_read (is_read)
) ENGINE=InnoDB;

-- ============================================================
-- DEFAULT ADMIN  (password: Admin@123456 — CHANGE THIS)
-- ============================================================
INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name)
VALUES (
  'admin@legalmarket.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYp7DJg8bVBqQ2W',
  'admin', 'Admin', 'User'
);
