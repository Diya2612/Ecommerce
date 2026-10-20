CREATE TYPE "public"."address_type_enum" AS ENUM('home', 'office', 'other');--> statement-breakpoint
CREATE TYPE "public"."blog_status" AS ENUM('public', 'private', 'draft');--> statement-breakpoint
CREATE TYPE "public"."cart_status" AS ENUM('active', 'converted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."collection_sort_order" AS ENUM('best-selling', 'price-asc', 'price-desc', 'manual', 'created-desc', 'created-asc');--> statement-breakpoint
CREATE TYPE "public"."collection_status" AS ENUM('active', 'inactive', 'draft');--> statement-breakpoint
CREATE TYPE "public"."collection_type" AS ENUM('manual', 'automated');--> statement-breakpoint
CREATE TYPE "public"."condition_match_type" AS ENUM('all', 'any');--> statement-breakpoint
CREATE TYPE "public"."customer_account_status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TYPE "public"."customer_segment" AS ENUM('new', 'regular', 'vip', 'at_risk');--> statement-breakpoint
CREATE TYPE "public"."buy_x_trigger_type" AS ENUM('quantity', 'amount');--> statement-breakpoint
CREATE TYPE "public"."discount_applies_to" AS ENUM('entire_order', 'specific_products', 'specific_collections');--> statement-breakpoint
CREATE TYPE "public"."discount_status" AS ENUM('active', 'inactive', 'draft', 'scheduled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y');--> statement-breakpoint
CREATE TYPE "public"."geo_restriction" AS ENUM('none', 'specific_regions');--> statement-breakpoint
CREATE TYPE "public"."get_y_applies_to" AS ENUM('same', 'specific_products', 'specific_collections', 'cheapest');--> statement-breakpoint
CREATE TYPE "public"."get_y_type" AS ENUM('free', 'percentage', 'amount', 'fixed_price');--> statement-breakpoint
CREATE TYPE "public"."discount_min_requirement_type" AS ENUM('none', 'min_amount', 'min_quantity');--> statement-breakpoint
CREATE TYPE "public"."shipping_scope" AS ENUM('all', 'specific_methods', 'specific_zones');--> statement-breakpoint
CREATE TYPE "public"."target_audience" AS ENUM('all', 'specific_customers', 'segments');--> statement-breakpoint
CREATE TYPE "public"."faq_section" AS ENUM('general', 'account', 'orders', 'payments', 'shipping', 'returns', 'products', 'policies');--> statement-breakpoint
CREATE TYPE "public"."adjustment_type" AS ENUM('increase', 'decrease', 'correction', 'write-off');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."inventory_condition" AS ENUM('sellable', 'damaged', 'quarantined', 'expired');--> statement-breakpoint
CREATE TYPE "public"."inventory_status" AS ENUM('in_stock', 'low_stock', 'out_of_stock');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('product', 'blog', 'category', 'collection', 'user', 'brand', 'vendor', 'global');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video', 'document', 'file');--> statement-breakpoint
CREATE TYPE "public"."delivery_status" AS ENUM('pending', 'sent', 'delivered', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."notification_frequency" AS ENUM('immediate', 'never');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('order_created', 'order_paid', 'order_shipped', 'order_delivered', 'order_cancelled', 'payment_authorized', 'payment_captured', 'payment_failed', 'payment_refunded', 'inventory_low_stock', 'inventory_out_of_stock', 'inventory_restocked', 'user_welcome', 'account_updated', 'password_changed', 'admin_broadcast', 'system_alert', 'promotion', 'newsletter');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('unfulfilled', 'partial', 'fulfilled', 'returned', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_discount_type" AS ENUM('percent', 'amount', 'none');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'partially_paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_transaction_status" AS ENUM('initiated', 'authorized', 'captured', 'failed', 'refund_initiated', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."tax_applies_to" AS ENUM('all', 'physical_goods', 'digital_goods', 'services', 'shipping');--> statement-breakpoint
CREATE TYPE "public"."tax_type" AS ENUM('inclusive', 'exclusive');--> statement-breakpoint
CREATE TYPE "public"."ticket_message_sender_type" AS ENUM('customer', 'agent', 'system', 'note');--> statement-breakpoint
CREATE TYPE "public"."ticket_channel" AS ENUM('email', 'chat', 'whatsapp', 'phone', 'system');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."ticket_source" AS ENUM('store', 'email', 'admin', 'api');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('open', 'pending', 'waiting_customer', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."tier_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"address_type" "address_type_enum" DEFAULT 'home' NOT NULL,
	"address_name" varchar(50),
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"is_default_billing" boolean DEFAULT false NOT NULL,
	"recipient_name" varchar(255) NOT NULL,
	"phone_number" varchar(20),
	"address_line1" varchar(255) NOT NULL,
	"address_line2" varchar(255),
	"city" varchar(100) NOT NULL,
	"state_province" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"country" varchar(100) NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"delivery_instructions" text,
	"is_international" boolean DEFAULT false NOT NULL,
	"tax_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"invite_token" varchar(64) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"assigned_role_id" uuid,
	"invited_by" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "invitation_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admin_profiles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"employee_number" varchar(50),
	"department" varchar(100),
	"job_title" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "admin_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "admin_profiles_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid,
	"user_email" varchar(255),
	"user_role" varchar(100),
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255),
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"session_id" varchar(255),
	"metadata" jsonb,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" varchar(255) NOT NULL,
	"quote" varchar(500),
	"description" varchar(150),
	"content" text,
	"slug" varchar(255) NOT NULL,
	"main_image_pc_url" text,
	"main_image_mobile_url" text,
	"notes" text,
	"category" varchar(100),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"author" varchar(255),
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"status" "blog_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"views_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"cart_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"quantity" integer DEFAULT 1 NOT NULL,
	"cost_price" numeric(12, 2) NOT NULL,
	"final_price" numeric(12, 2) NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"line_subtotal" numeric(12, 2) NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"product_name" varchar(255),
	"product_image_url" text,
	"product_sku" varchar(100),
	"reserved_at" timestamp,
	"reservation_id" uuid,
	"reservation_expires_at" timestamp,
	"saved_for_later" boolean DEFAULT false NOT NULL,
	"price_at_add" numeric(12, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "cart_items_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid,
	"session_id" varchar(100),
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_total" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"shipping_total" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"tax_total" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"grand_total" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"applied_discount_codes" jsonb DEFAULT '[]'::jsonb,
	"applied_giftcard_codes" jsonb DEFAULT '[]'::jsonb,
	"removed_discount_info" jsonb DEFAULT '[]'::jsonb,
	"cart_status" "cart_status" DEFAULT 'active' NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"session_expires_at" timestamp,
	"abandoned_at" timestamp,
	"recovery_email_sent" boolean DEFAULT false NOT NULL,
	"recovery_email_sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "chatbot_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" bigint NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"is_embedded" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chatbot_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"sources" jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "chatbot_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "collection_products" (
	"collection_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "collection_products_collection_id_product_id_pk" PRIMARY KEY("collection_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"type" "collection_type" DEFAULT 'manual' NOT NULL,
	"status" "collection_status" DEFAULT 'draft' NOT NULL,
	"sort_order" "collection_sort_order" DEFAULT 'manual' NOT NULL,
	"condition_match_type" "condition_match_type" DEFAULT 'all',
	"banner_image_url" text,
	"mobile_banner_image_url" text,
	"meta_title" varchar(255),
	"meta_description" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"published_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"segments" text[] DEFAULT ARRAY['new']::text[] NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL,
	"sms_opt_in" boolean DEFAULT false NOT NULL,
	"email_opt_in" boolean DEFAULT true NOT NULL,
	"whatsapp_opt_in" boolean DEFAULT false NOT NULL,
	"push_notifications_opt_in" boolean DEFAULT true NOT NULL,
	"account_status" "customer_account_status" DEFAULT 'active' NOT NULL,
	"banned_reason" text,
	"banned_until" timestamp,
	"risk_profile" varchar(20) DEFAULT 'low',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "discount_buy_x_collections" (
	"discount_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	CONSTRAINT "discount_buy_x_collections_discount_id_collection_id_pk" PRIMARY KEY("discount_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "discount_buy_x_products" (
	"discount_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "discount_buy_x_products_discount_id_product_id_pk" PRIMARY KEY("discount_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "discount_customers" (
	"discount_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "discount_customers_discount_id_user_id_pk" PRIMARY KEY("discount_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "discount_get_y_collections" (
	"discount_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	CONSTRAINT "discount_get_y_collections_discount_id_collection_id_pk" PRIMARY KEY("discount_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "discount_get_y_products" (
	"discount_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "discount_get_y_products_discount_id_product_id_pk" PRIMARY KEY("discount_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "discount_regions" (
	"discount_id" uuid NOT NULL,
	"country_code" varchar(3) NOT NULL,
	"region_code" varchar(10),
	CONSTRAINT "discount_regions_discount_id_country_code_pk" PRIMARY KEY("discount_id","country_code")
);
--> statement-breakpoint
CREATE TABLE "discount_shipping_methods" (
	"discount_id" uuid NOT NULL,
	"shipping_method_id" varchar(50) NOT NULL,
	CONSTRAINT "discount_shipping_methods_discount_id_shipping_method_id_pk" PRIMARY KEY("discount_id","shipping_method_id")
);
--> statement-breakpoint
CREATE TABLE "discount_shipping_zones" (
	"discount_id" uuid NOT NULL,
	"shipping_zone_id" varchar(50) NOT NULL,
	CONSTRAINT "discount_shipping_zones_discount_id_shipping_zone_id_pk" PRIMARY KEY("discount_id","shipping_zone_id")
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"code" varchar(50) PRIMARY KEY NOT NULL,
	"discount_id" uuid NOT NULL,
	"usage_limit" integer,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"max_uses_per_customer" integer,
	"allowed_user_ids" jsonb DEFAULT '[]'::jsonb,
	"allowed_email_domains" jsonb DEFAULT '[]'::jsonb,
	"required_customer_tags" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "discount_collections" (
	"discount_id" uuid NOT NULL,
	"collection_id" uuid NOT NULL,
	CONSTRAINT "discount_collections_discount_id_collection_id_pk" PRIMARY KEY("discount_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "discount_products" (
	"discount_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	CONSTRAINT "discount_products_discount_id_product_id_pk" PRIMARY KEY("discount_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "discount_usage" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"discount_id" uuid,
	"discount_code" varchar(50),
	"user_id" uuid,
	"guest_email" varchar(255),
	"order_id" uuid,
	"order_number" varchar(40),
	"discount_type" varchar(30) NOT NULL,
	"discount_value" numeric(10, 2),
	"discount_amount" numeric(12, 2) NOT NULL,
	"order_subtotal" numeric(12, 2),
	"order_total" numeric(12, 2),
	"items_count" integer,
	"used_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discounts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(500),
	"type" "discount_type" NOT NULL,
	"value" numeric(10, 2),
	"max_discount_amount" numeric(10, 2),
	"applies_to" "discount_applies_to" DEFAULT 'entire_order' NOT NULL,
	"min_requirement_type" "discount_min_requirement_type" DEFAULT 'none' NOT NULL,
	"min_requirement_value" numeric(10, 2),
	"buy_x_trigger_type" "buy_x_trigger_type",
	"buy_x_value" numeric(10, 2),
	"buy_x_applies_to" "discount_applies_to",
	"buy_x_same_product" boolean DEFAULT false,
	"buy_x_repeat" boolean DEFAULT true,
	"get_y_type" "get_y_type",
	"get_y_applies_to" "get_y_applies_to",
	"get_y_quantity" integer,
	"get_y_value" numeric(10, 2),
	"get_y_max_rewards" integer,
	"shipping_scope" "shipping_scope",
	"shipping_min_amount" numeric(10, 2),
	"shipping_min_items" integer,
	"shipping_cap" numeric(10, 2),
	"target_audience" "target_audience" DEFAULT 'all' NOT NULL,
	"geo_restriction" "geo_restriction" DEFAULT 'none' NOT NULL,
	"usage_limit" integer,
	"usage_per_customer" integer,
	"usage_per_day" integer,
	"usage_per_order" integer,
	"once_per_customer" boolean DEFAULT false NOT NULL,
	"limit_new_customers" boolean DEFAULT false NOT NULL,
	"limit_returning_customers" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp,
	"status" "discount_status" DEFAULT 'draft' NOT NULL,
	"total_usage_count" integer DEFAULT 0 NOT NULL,
	"total_discount_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_orders_count" integer DEFAULT 0 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"admin_comment" varchar(500),
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "discounts_dates_check" CHECK (ends_at IS NULL OR ends_at > starts_at),
	CONSTRAINT "discounts_value_check" CHECK (
      (type IN ('free_shipping', 'buy_x_get_y')) OR 
      (type IN ('percentage', 'fixed_amount') AND value IS NOT NULL)
    )
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"section" "faq_section" DEFAULT 'general' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "inventory_adjustments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"inventory_id" uuid NOT NULL,
	"adjustment_type" "adjustment_type" NOT NULL,
	"quantity_change" integer NOT NULL,
	"reason" varchar(500) NOT NULL,
	"reference_number" varchar(100),
	"quantity_before" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"adjusted_by" uuid NOT NULL,
	"adjusted_at" timestamp DEFAULT now() NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp,
	"approval_status" "approval_status" DEFAULT 'approved' NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"available_quantity" integer DEFAULT 0 NOT NULL,
	"committed_quantity" integer DEFAULT 0 NOT NULL,
	"low_stock_threshold" integer DEFAULT 0 NOT NULL,
	"location" varchar(100) DEFAULT 'Nashik' NOT NULL,
	"condition" "inventory_condition" DEFAULT 'sellable' NOT NULL,
	"status" "inventory_status" DEFAULT 'in_stock' NOT NULL,
	"total_sold" integer DEFAULT 0 NOT NULL,
	"total_fulfilled" integer DEFAULT 0 NOT NULL,
	"last_stock_movement_at" timestamp,
	"last_sale_at" timestamp,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "uq_inventory_product_variant" UNIQUE("product_id","variant_id"),
	CONSTRAINT "inventory_available_qty_check" CHECK (available_quantity >= 0),
	CONSTRAINT "inventory_committed_qty_check" CHECK (committed_quantity >= 0),
	CONSTRAINT "inventory_total_sold_check" CHECK (total_sold >= 0),
	CONSTRAINT "inventory_total_fulfilled_check" CHECK (total_fulfilled >= 0),
	CONSTRAINT "inventory_product_or_variant_check" CHECK ((product_id IS NOT NULL AND variant_id IS NULL) OR (product_id IS NULL AND variant_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"invoice_version_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"hsn_code" varchar(10),
	"quantity" integer NOT NULL,
	"unit_price" numeric(15, 2) NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"cgst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"sgst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"igst_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"line_total" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_versions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_gstin" varchar(20),
	"billing_address" text NOT NULL,
	"shipping_address" text NOT NULL,
	"place_of_supply" varchar(255) NOT NULL,
	"subtotal" numeric(15, 2) NOT NULL,
	"discount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"shipping" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"grand_total" numeric(15, 2) NOT NULL,
	"cgst" numeric(15, 2) DEFAULT '0' NOT NULL,
	"sgst" numeric(15, 2) DEFAULT '0' NOT NULL,
	"igst" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tax_type" varchar(20) DEFAULT 'cgst_sgst' NOT NULL,
	"pdf_url" text,
	"pdf_path" text,
	"pdf_generated_at" timestamp,
	"reason" text DEFAULT 'INITIAL' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"latest_version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "entity_media" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"upload_id" uuid NOT NULL,
	"media_type" "media_type" NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"alt_text" varchar(255),
	"caption" text,
	"tags" text[] DEFAULT '{}',
	"folder_path" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_delivery_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"notification_id" uuid NOT NULL,
	"channel" varchar(50) NOT NULL,
	"status" "delivery_status" DEFAULT 'pending' NOT NULL,
	"recipient" varchar(255),
	"provider" varchar(100),
	"provider_message_id" varchar(255),
	"provider_response" jsonb,
	"error_message" text,
	"error_code" varchar(50),
	"retry_count" integer DEFAULT 0,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"channel_email" boolean DEFAULT true NOT NULL,
	"channel_sms" boolean DEFAULT false NOT NULL,
	"channel_in_app" boolean DEFAULT true NOT NULL,
	"channel_push" boolean DEFAULT true NOT NULL,
	"frequency" "notification_frequency" DEFAULT 'immediate' NOT NULL,
	"quiet_hours_enabled" boolean DEFAULT false NOT NULL,
	"quiet_hours_start" time,
	"quiet_hours_end" time,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50),
	"subject" varchar(255),
	"body_text" text,
	"body_html" text,
	"sms_template" text,
	"in_app_title" varchar(255),
	"in_app_message" text,
	"variables" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"channels" jsonb DEFAULT '["in_app"]'::jsonb NOT NULL,
	"priority" "notification_priority" DEFAULT 'normal' NOT NULL,
	"action_url" varchar(500),
	"action_text" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"sku" varchar(100),
	"product_name" varchar(255) NOT NULL,
	"product_image" text,
	"cost_price" numeric(12, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"line_total" numeric(12, 2) NOT NULL,
	"discount_type" varchar(20) DEFAULT '' NOT NULL,
	"discount_value" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_reason" varchar(255),
	"quantity_fulfilled" integer DEFAULT 0 NOT NULL,
	"quantity_cancelled" integer DEFAULT 0 NOT NULL,
	"quantity_returned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_number" varchar(40) NOT NULL,
	"user_id" uuid,
	"cart_id" uuid,
	"shipping_address_id" uuid,
	"billing_address_id" uuid,
	"order_status" "order_status" DEFAULT 'pending' NOT NULL,
	"is_draft" boolean DEFAULT false NOT NULL,
	"payment_method" varchar(60),
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_ref" varchar(120),
	"transaction_id" varchar(120),
	"paid_at" timestamp,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"razorpay_order_id" varchar(50),
	"payment_link_expires_at" timestamp,
	"payment_attempts" integer DEFAULT 0 NOT NULL,
	"last_payment_error" varchar(500),
	"subtotal" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_id" uuid,
	"discount_code_id" varchar(50),
	"discount_type" "order_discount_type" DEFAULT 'none' NOT NULL,
	"discount_value" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"discount_code" varchar(80),
	"discount_reason" varchar(255),
	"payment_note" varchar(255),
	"shipping_method" varchar(120),
	"shipping_option" varchar(120),
	"shipping_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"delivery_price" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"partial_cod_charges" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"advance_paid_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"tax_rule_id" uuid,
	"tax_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"cgst" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"sgst" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"igst" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_quantity" integer DEFAULT 0 NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'unfulfilled' NOT NULL,
	"fulfillment_date" timestamp,
	"delivery_date" timestamp,
	"return_date" timestamp,
	"return_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"order_tracking" varchar(200),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"customer_note" varchar(500),
	"admin_comment" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"order_id" uuid NOT NULL,
	"razorpay_order_id" varchar(50) NOT NULL,
	"razorpay_payment_id" varchar(50),
	"razorpay_signature" varchar(256),
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "payment_transaction_status" DEFAULT 'initiated' NOT NULL,
	"payment_method" varchar(50),
	"payment_method_details" jsonb,
	"error_code" varchar(50),
	"error_description" varchar(500),
	"error_source" varchar(50),
	"error_step" varchar(50),
	"error_reason" varchar(200),
	"refund_id" varchar(50),
	"refund_amount" numeric(15, 2),
	"refund_reason" varchar(200),
	"refunded_at" timestamp,
	"webhook_verified" boolean DEFAULT false NOT NULL,
	"webhook_received_at" timestamp,
	"idempotency_key" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp,
	CONSTRAINT "payment_transactions_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "payment_tx_valid_amount" CHECK (amount > 0)
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_logs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"event_id" varchar(100),
	"event_type" varchar(100) NOT NULL,
	"razorpay_order_id" varchar(50),
	"razorpay_payment_id" varchar(50),
	"raw_payload" jsonb NOT NULL,
	"signature_verified" boolean DEFAULT false NOT NULL,
	"processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	"processing_error" varchar(500),
	"retry_count" integer DEFAULT 0 NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_webhook_logs_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "product_faqs" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"option_name" varchar(100) NOT NULL,
	"option_value" varchar(100) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(50),
	"cost_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"selling_price" numeric(15, 2) NOT NULL,
	"compare_at_price" numeric(15, 2),
	"image_url" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "uq_variant_option" UNIQUE("product_id","option_name","option_value"),
	CONSTRAINT "product_variants_cost_price_check" CHECK (cost_price >= 0),
	CONSTRAINT "product_variants_selling_price_check" CHECK (selling_price >= 0),
	CONSTRAINT "product_variants_compare_at_price_check" CHECK (compare_at_price IS NULL OR compare_at_price >= selling_price)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"slug" varchar(255) NOT NULL,
	"product_title" varchar(255) NOT NULL,
	"secondary_title" varchar(255),
	"short_description" text,
	"full_description" text,
	"admin_comment" text,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"cost_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"selling_price" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"compare_at_price" numeric(15, 2),
	"sku" varchar(100) NOT NULL,
	"hsn_code" varchar(20),
	"barcode" varchar(50),
	"weight" numeric(8, 2),
	"length" numeric(8, 2),
	"breadth" numeric(8, 2),
	"height" numeric(8, 2),
	"category_tier_1" uuid,
	"category_tier_2" uuid,
	"category_tier_3" uuid,
	"category_tier_4" uuid,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"primary_image_url" text,
	"thumbnail_url" text,
	"additional_images" jsonb DEFAULT '[]'::jsonb,
	"has_variants" boolean DEFAULT false NOT NULL,
	"max_order_quantity" integer DEFAULT 0 NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"product_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	"search_vector" "tsvector" GENERATED ALWAYS AS (to_tsvector('english', COALESCE(product_title, '') || ' ' || COALESCE(short_description, ''))) STORED,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_cost_price_check" CHECK (cost_price >= 0),
	CONSTRAINT "products_selling_price_check" CHECK (selling_price >= 0),
	CONSTRAINT "products_compare_at_price_check" CHECK (compare_at_price IS NULL OR compare_at_price >= selling_price)
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(100) NOT NULL,
	"resource" varchar(50) NOT NULL,
	"action" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"is_system_role" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "user_roles_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "product_questions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"answered_by" uuid,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"product_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"comment" text,
	"media_urls" jsonb DEFAULT '[]'::jsonb,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"status" "review_status" DEFAULT 'pending' NOT NULL,
	"admin_reply" text,
	"helpful_votes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "reviews_rating_check" CHECK (rating >= 1 AND rating <= 5)
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"is_base_currency" boolean DEFAULT false NOT NULL,
	"use_real_time_rates" boolean DEFAULT true NOT NULL,
	"exchange_rate" numeric(18, 8) DEFAULT '1.00000000' NOT NULL,
	"manual_exchange_rate" numeric(18, 8),
	"rate_last_updated_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "currencies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(2) NOT NULL,
	"code_alpha3" varchar(3) NOT NULL,
	"name" varchar(100) NOT NULL,
	"phone_code" varchar(10),
	"currency_code" varchar(3),
	"is_shipping_enabled" boolean DEFAULT false NOT NULL,
	"is_billing_enabled" boolean DEFAULT false NOT NULL,
	"requires_state" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code"),
	CONSTRAINT "countries_code_alpha3_unique" UNIQUE("code_alpha3")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"has_special_tax" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_rules" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"country_code" varchar(2) NOT NULL,
	"region_code" varchar(10),
	"postal_code_pattern" varchar(20),
	"tax_name" varchar(100) NOT NULL,
	"tax_code" varchar(20),
	"tax_rate" numeric(6, 3) NOT NULL,
	"tax_type" "tax_type" DEFAULT 'exclusive' NOT NULL,
	"applies_to" "tax_applies_to" DEFAULT 'all' NOT NULL,
	"is_compound" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"effective_from" date NOT NULL,
	"effective_until" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'product' NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"sender_type" "ticket_message_sender_type" DEFAULT 'customer' NOT NULL,
	"sender_id" uuid,
	"message" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"ticket_number" varchar(50) NOT NULL,
	"customer_id" uuid,
	"order_id" uuid,
	"assigned_to" uuid,
	"subject" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"priority" "ticket_priority" DEFAULT 'medium' NOT NULL,
	"status" "ticket_status" DEFAULT 'open' NOT NULL,
	"channel" "ticket_channel" DEFAULT 'system' NOT NULL,
	"created_via" "ticket_source" DEFAULT 'store' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"last_message_at" timestamp DEFAULT now() NOT NULL,
	"first_response_at" timestamp,
	"resolved_at" timestamp,
	"satisfaction_rating" integer,
	"satisfaction_comment" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" uuid,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(255) NOT NULL,
	"description" text,
	"level" integer NOT NULL,
	"parent_id" uuid,
	"priority" integer DEFAULT 0 NOT NULL,
	"status" "tier_status" DEFAULT 'active' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "tiers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"file_size" bigint NOT NULL,
	"file_path" text NOT NULL,
	"file_url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"file_hash" varchar(64),
	"reference_count" bigint DEFAULT 1 NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "uploads_file_hash_unique" UNIQUE("file_hash")
);
--> statement-breakpoint
CREATE TABLE "email_otps" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"otp_code" varchar(6) NOT NULL,
	"purpose" varchar(50) DEFAULT 'email_verification' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"expires_at" timestamp NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"auth_id" uuid,
	"display_id" varchar(20),
	"first_name" varchar(255) NOT NULL,
	"middle_name" varchar(255),
	"last_name" varchar(255) NOT NULL,
	"display_name" varchar(100),
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"email_verified" boolean DEFAULT false NOT NULL,
	"email_verified_at" timestamp,
	"phone_number" varchar(20),
	"phone_type" varchar(20) DEFAULT 'mobile',
	"phone_verified" boolean DEFAULT false NOT NULL,
	"phone_verified_at" timestamp,
	"secondary_email" varchar(255),
	"email_type" varchar(20) DEFAULT 'personal',
	"secondary_email_type" varchar(20) DEFAULT 'work',
	"secondary_email_verified" boolean DEFAULT false NOT NULL,
	"secondary_phone_number" varchar(20),
	"secondary_phone_type" varchar(20) DEFAULT 'work',
	"profile_image_url" varchar(500),
	"date_of_birth" date,
	"gender" "gender",
	"tags" text[],
	"metadata" jsonb,
	"preferred_language" varchar(10) DEFAULT 'en' NOT NULL,
	"languages" text[],
	"preferred_currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "users_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "users_display_id_unique" UNIQUE("display_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"wishlist_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"notes" text,
	"added_to_cart_at" timestamp,
	"purchased_at" timestamp,
	"order_id" uuid,
	"added_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_items_wishlist_id_product_id_pk" PRIMARY KEY("wishlist_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" varchar(255),
	"status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_documents" ADD CONSTRAINT "chatbot_documents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_session_id_chatbot_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chatbot_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatbot_sessions" ADD CONSTRAINT "chatbot_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_products" ADD CONSTRAINT "collection_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collections" ADD CONSTRAINT "collections_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_buy_x_collections" ADD CONSTRAINT "discount_buy_x_collections_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_buy_x_collections" ADD CONSTRAINT "discount_buy_x_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_buy_x_products" ADD CONSTRAINT "discount_buy_x_products_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_buy_x_products" ADD CONSTRAINT "discount_buy_x_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_customers" ADD CONSTRAINT "discount_customers_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_customers" ADD CONSTRAINT "discount_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_get_y_collections" ADD CONSTRAINT "discount_get_y_collections_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_get_y_collections" ADD CONSTRAINT "discount_get_y_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_get_y_products" ADD CONSTRAINT "discount_get_y_products_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_get_y_products" ADD CONSTRAINT "discount_get_y_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_regions" ADD CONSTRAINT "discount_regions_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_shipping_methods" ADD CONSTRAINT "discount_shipping_methods_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_shipping_zones" ADD CONSTRAINT "discount_shipping_zones_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_codes" ADD CONSTRAINT "discount_codes_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_collections" ADD CONSTRAINT "discount_collections_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_collections" ADD CONSTRAINT "discount_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_products" ADD CONSTRAINT "discount_products_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_products" ADD CONSTRAINT "discount_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_discount_id_discounts_id_fk" FOREIGN KEY ("discount_id") REFERENCES "public"."discounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_discount_code_discount_codes_code_fk" FOREIGN KEY ("discount_code") REFERENCES "public"."discount_codes"("code") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_usage" ADD CONSTRAINT "discount_usage_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_inventory_id_inventory_id_fk" FOREIGN KEY ("inventory_id") REFERENCES "public"."inventory"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_adjusted_by_users_id_fk" FOREIGN KEY ("adjusted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_adjustments" ADD CONSTRAINT "inventory_adjustments_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_version_id_invoice_versions_id_fk" FOREIGN KEY ("invoice_version_id") REFERENCES "public"."invoice_versions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_versions" ADD CONSTRAINT "invoice_versions_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_media" ADD CONSTRAINT "entity_media_upload_id_uploads_id_fk" FOREIGN KEY ("upload_id") REFERENCES "public"."uploads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_delivery_logs" ADD CONSTRAINT "notification_delivery_logs_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_address_id_user_addresses_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_billing_address_id_user_addresses_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."user_addresses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_faqs" ADD CONSTRAINT "product_faqs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_tier_1_tiers_id_fk" FOREIGN KEY ("category_tier_1") REFERENCES "public"."tiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_tier_2_tiers_id_fk" FOREIGN KEY ("category_tier_2") REFERENCES "public"."tiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_tier_3_tiers_id_fk" FOREIGN KEY ("category_tier_3") REFERENCES "public"."tiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_tier_4_tiers_id_fk" FOREIGN KEY ("category_tier_4") REFERENCES "public"."tiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_questions" ADD CONSTRAINT "product_questions_answered_by_users_id_fk" FOREIGN KEY ("answered_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "currencies" ADD CONSTRAINT "currencies_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_deleted_by_users_id_fk" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tiers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_addresses_user_id_idx" ON "user_addresses" USING btree ("user_id","is_deleted");--> statement-breakpoint
CREATE INDEX "user_addresses_user_default_shipping_idx" ON "user_addresses" USING btree ("user_id","is_default_shipping","is_deleted");--> statement-breakpoint
CREATE INDEX "user_addresses_user_default_billing_idx" ON "user_addresses" USING btree ("user_id","is_default_billing","is_deleted");--> statement-breakpoint
CREATE INDEX "user_addresses_user_default_idx" ON "user_addresses" USING btree ("user_id","is_default_shipping","is_default_billing","is_deleted");--> statement-breakpoint
CREATE INDEX "user_addresses_country_idx" ON "user_addresses" USING btree ("country_code");--> statement-breakpoint
CREATE UNIQUE INDEX "user_addresses_unique_default_shipping_idx" ON "user_addresses" USING btree ("user_id") WHERE "user_addresses"."is_default_shipping" = true and "user_addresses"."is_deleted" = false;--> statement-breakpoint
CREATE UNIQUE INDEX "user_addresses_unique_default_billing_idx" ON "user_addresses" USING btree ("user_id") WHERE "user_addresses"."is_default_billing" = true and "user_addresses"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "admin_profiles_department_idx" ON "admin_profiles" USING btree ("department","is_active");--> statement-breakpoint
CREATE INDEX "admin_profiles_is_active_idx" ON "admin_profiles" USING btree ("is_active","is_deleted");--> statement-breakpoint
CREATE INDEX "admin_profiles_employee_number_idx" ON "admin_profiles" USING btree ("employee_number");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "blogs_status_idx" ON "blogs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "blogs_category_idx" ON "blogs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_product_id_idx" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "carts_user_id_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "carts_session_id_idx" ON "carts" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "carts_status_activity_idx" ON "carts" USING btree ("cart_status","last_activity_at");--> statement-breakpoint
CREATE INDEX "chatbot_documents_status_is_deleted_idx" ON "chatbot_documents" USING btree ("status","is_deleted");--> statement-breakpoint
CREATE INDEX "chatbot_documents_created_at_idx" ON "chatbot_documents" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chatbot_messages_session_id_is_deleted_idx" ON "chatbot_messages" USING btree ("session_id","is_deleted");--> statement-breakpoint
CREATE INDEX "chatbot_messages_created_at_idx" ON "chatbot_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "chatbot_sessions_user_id_is_deleted_idx" ON "chatbot_sessions" USING btree ("user_id","is_deleted");--> statement-breakpoint
CREATE INDEX "chatbot_sessions_created_at_idx" ON "chatbot_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "collection_products_product_id_idx" ON "collection_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "collections_type_idx" ON "collections" USING btree ("type");--> statement-breakpoint
CREATE INDEX "collections_status_idx" ON "collections" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customer_profiles_status_idx" ON "customer_profiles" USING btree ("account_status");--> statement-breakpoint
CREATE INDEX "customer_profiles_risk_idx" ON "customer_profiles" USING btree ("risk_profile");--> statement-breakpoint
CREATE INDEX "discount_buy_x_collections_collection_id_idx" ON "discount_buy_x_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "discount_buy_x_products_product_id_idx" ON "discount_buy_x_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "discount_customers_user_id_idx" ON "discount_customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discount_get_y_collections_collection_id_idx" ON "discount_get_y_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "discount_get_y_products_product_id_idx" ON "discount_get_y_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "discount_regions_country_code_idx" ON "discount_regions" USING btree ("country_code");--> statement-breakpoint
CREATE INDEX "discount_shipping_methods_method_id_idx" ON "discount_shipping_methods" USING btree ("shipping_method_id");--> statement-breakpoint
CREATE INDEX "discount_shipping_zones_zone_id_idx" ON "discount_shipping_zones" USING btree ("shipping_zone_id");--> statement-breakpoint
CREATE INDEX "discount_codes_discount_id_idx" ON "discount_codes" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "discount_collections_collection_id_idx" ON "discount_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "discount_products_product_id_idx" ON "discount_products" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "discount_usage_discount_id_idx" ON "discount_usage" USING btree ("discount_id");--> statement-breakpoint
CREATE INDEX "discount_usage_discount_code_idx" ON "discount_usage" USING btree ("discount_code");--> statement-breakpoint
CREATE INDEX "discount_usage_user_id_idx" ON "discount_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discount_usage_order_id_idx" ON "discount_usage" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "discount_usage_used_at_idx" ON "discount_usage" USING btree ("used_at");--> statement-breakpoint
CREATE INDEX "discount_usage_user_discount_idx" ON "discount_usage" USING btree ("user_id","discount_id");--> statement-breakpoint
CREATE INDEX "discount_usage_user_code_idx" ON "discount_usage" USING btree ("user_id","discount_code");--> statement-breakpoint
CREATE INDEX "discounts_status_idx" ON "discounts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "discounts_type_idx" ON "discounts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "discounts_dates_idx" ON "discounts" USING btree ("starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "discounts_is_deleted_idx" ON "discounts" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "discounts_active_idx" ON "discounts" USING btree ("status","is_deleted","starts_at","ends_at");--> statement-breakpoint
CREATE INDEX "faqs_section_idx" ON "faqs" USING btree ("section");--> statement-breakpoint
CREATE INDEX "faqs_status_idx" ON "faqs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "inventory_adjustments_inventory_adjusted_idx" ON "inventory_adjustments" USING btree ("inventory_id","adjusted_at");--> statement-breakpoint
CREATE INDEX "inventory_product_idx" ON "inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_variant_idx" ON "inventory" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "inventory_status_idx" ON "inventory" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoice_line_items_invoice_version_id_idx" ON "invoice_line_items" USING btree ("invoice_version_id");--> statement-breakpoint
CREATE INDEX "invoice_versions_invoice_id_idx" ON "invoice_versions" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_versions_version_number_idx" ON "invoice_versions" USING btree ("version_number");--> statement-breakpoint
CREATE INDEX "invoices_order_id_idx" ON "invoices" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "invoices_invoice_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "entity_media_entity_idx" ON "entity_media" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "entity_media_display_order_idx" ON "entity_media" USING btree ("entity_type","entity_id","display_order");--> statement-breakpoint
CREATE INDEX "entity_media_upload_id_idx" ON "entity_media" USING btree ("upload_id");--> statement-breakpoint
CREATE INDEX "entity_media_primary_idx" ON "entity_media" USING btree ("entity_type","entity_id","is_primary");--> statement-breakpoint
CREATE INDEX "entity_media_type_idx" ON "entity_media" USING btree ("entity_type","entity_id","media_type");--> statement-breakpoint
CREATE INDEX "entity_media_tags_idx" ON "entity_media" USING btree ("tags");--> statement-breakpoint
CREATE INDEX "entity_media_folder_idx" ON "entity_media" USING btree ("folder_path");--> statement-breakpoint
CREATE INDEX "idx_notifications_user_read" ON "notifications" USING btree ("user_id","is_read") WHERE "notifications"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_fulfillment_status_idx" ON "orders" USING btree ("fulfillment_status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_draft_payment_idx" ON "orders" USING btree ("is_draft","payment_status");--> statement-breakpoint
CREATE INDEX "orders_razorpay_order_id_idx" ON "orders" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_status" ON "orders" USING btree ("user_id","order_status") WHERE "orders"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "idx_orders_status_dates" ON "orders" USING btree ("order_status","created_at");--> statement-breakpoint
CREATE INDEX "orders_active_user_status_idx" ON "orders" USING btree ("user_id","order_status","created_at") WHERE "orders"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "orders_user_list_covering_idx" ON "orders" USING btree ("user_id","created_at") WHERE "orders"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "payment_tx_order_id_idx" ON "payment_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_tx_rp_order_id_idx" ON "payment_transactions" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX "payment_tx_rp_payment_id_idx" ON "payment_transactions" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE INDEX "payment_tx_status_idx" ON "payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_tx_created_at_idx" ON "payment_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "webhook_logs_event_type_idx" ON "payment_webhook_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "webhook_logs_rp_order_idx" ON "payment_webhook_logs" USING btree ("razorpay_order_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_rp_payment_idx" ON "payment_webhook_logs" USING btree ("razorpay_payment_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_processed_idx" ON "payment_webhook_logs" USING btree ("processed");--> statement-breakpoint
CREATE INDEX "webhook_logs_received_at_idx" ON "payment_webhook_logs" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "product_faqs_product_id_idx" ON "product_faqs" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_active_idx" ON "product_variants" USING btree ("product_id","is_active") WHERE "product_variants"."is_deleted" = false and "product_variants"."is_active" = true;--> statement-breakpoint
CREATE INDEX "products_search_vector_idx" ON "products" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "products_tags_idx" ON "products" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "products_category_price_status_idx" ON "products" USING btree ("category_tier_1","selling_price","status","is_deleted");--> statement-breakpoint
CREATE INDEX "products_active_idx" ON "products" USING btree ("id","status","selling_price") WHERE "products"."is_deleted" = false and "products"."status" = 'active';--> statement-breakpoint
CREATE INDEX "products_created_at_status_idx" ON "products" USING btree ("created_at") WHERE "products"."status" = 'active' and "products"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "products_featured_status_idx" ON "products" USING btree ("featured","status") WHERE "products"."status" = 'active' and "products"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "products_list_covering_idx" ON "products" USING btree ("category_tier_1","selling_price") WHERE "products"."status" = 'active' and "products"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "permissions_resource_idx" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "permissions_resource_action_idx" ON "permissions" USING btree ("resource","action");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "roles_is_active_idx" ON "roles" USING btree ("is_active","is_deleted");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "user_roles_expires_at_idx" ON "user_roles" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "product_questions_product_id_idx" ON "product_questions" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_questions_status_idx" ON "product_questions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_questions_answered_by_idx" ON "product_questions" USING btree ("answered_by") WHERE "product_questions"."answered_by" is not null;--> statement-breakpoint
CREATE INDEX "reviews_product_id_idx" ON "reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reviews_rating_idx" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "reviews_approved_idx" ON "reviews" USING btree ("product_id","rating","created_at") WHERE "reviews"."status" = 'approved' and "reviews"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "reviews_product_status_created_idx" ON "reviews" USING btree ("product_id","created_at") WHERE "reviews"."status" = 'approved' and "reviews"."is_deleted" = false;--> statement-breakpoint
CREATE INDEX "currencies_active_idx" ON "currencies" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "currencies_base_idx" ON "currencies" USING btree ("is_base_currency");--> statement-breakpoint
CREATE INDEX "currencies_code_idx" ON "currencies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "countries_active_idx" ON "countries" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "countries_code_idx" ON "countries" USING btree ("code");--> statement-breakpoint
CREATE INDEX "regions_country_idx" ON "regions" USING btree ("country_code","is_active");--> statement-breakpoint
CREATE INDEX "regions_country_code_unique_idx" ON "regions" USING btree ("country_code","code");--> statement-breakpoint
CREATE INDEX "tax_rules_country_active_idx" ON "tax_rules" USING btree ("country_code","is_active","effective_from");--> statement-breakpoint
CREATE INDEX "tax_rules_region_idx" ON "tax_rules" USING btree ("country_code","region_code");--> statement-breakpoint
CREATE INDEX "tax_rules_tax_code_idx" ON "tax_rules" USING btree ("tax_code");--> statement-breakpoint
CREATE INDEX "tax_rules_effective_idx" ON "tax_rules" USING btree ("effective_from","effective_until");--> statement-breakpoint
CREATE INDEX "tags_type_idx" ON "tags" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tags_active_type_idx" ON "tags" USING btree ("type","usage_count") WHERE "tags"."is_deleted" = false and "tags"."status" = true;--> statement-breakpoint
CREATE INDEX "ticket_messages_ticket_created_idx" ON "ticket_messages" USING btree ("ticket_id","created_at");--> statement-breakpoint
CREATE INDEX "ticket_messages_sender_type_idx" ON "ticket_messages" USING btree ("sender_type");--> statement-breakpoint
CREATE INDEX "tickets_ticket_number_idx" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "tickets_customer_status_idx" ON "tickets" USING btree ("customer_id","status");--> statement-breakpoint
CREATE INDEX "tickets_assigned_status_idx" ON "tickets" USING btree ("assigned_to","status");--> statement-breakpoint
CREATE INDEX "tickets_status_priority_idx" ON "tickets" USING btree ("status","priority");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tickets_category_idx" ON "tickets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tiers_parent_id_idx" ON "tiers" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "tiers_level_idx" ON "tiers" USING btree ("level");--> statement-breakpoint
CREATE INDEX "tiers_status_idx" ON "tiers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tiers_active_level_idx" ON "tiers" USING btree ("level","parent_id","priority") WHERE "tiers"."is_deleted" = false and "tiers"."status" = 'active';--> statement-breakpoint
CREATE INDEX "email_otps_email_idx" ON "email_otps" USING btree ("email");--> statement-breakpoint
CREATE INDEX "email_otps_expires_at_idx" ON "email_otps" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "users_email_is_deleted_idx" ON "users" USING btree ("email","is_deleted");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_auth_id_idx" ON "users" USING btree ("auth_id");--> statement-breakpoint
CREATE INDEX "users_display_id_idx" ON "users" USING btree ("display_id");--> statement-breakpoint
CREATE INDEX "users_email_verified_idx" ON "users" USING btree ("email_verified","is_deleted");--> statement-breakpoint
CREATE INDEX "wishlist_items_product_id_idx" ON "wishlist_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "wishlists_user_id_idx" ON "wishlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlists_access_token_idx" ON "wishlists" USING btree ("access_token");--> statement-breakpoint
CREATE INDEX "wishlists_active_user_idx" ON "wishlists" USING btree ("user_id","updated_at") WHERE "wishlists"."status" = true;