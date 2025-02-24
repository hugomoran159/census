resource "aws_s3_bucket" "property_tiles" {
  bucket = "my-prod-bucket-ireland-12345"
  force_destroy = true # For development only - remove in production
}

resource "aws_s3_bucket_acl" "property_tiles" {
  bucket = aws_s3_bucket.property_tiles.id
  acl    = "public-read"
}

resource "aws_s3_bucket_public_access_block" "property_tiles" {
  bucket = aws_s3_bucket.property_tiles.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.property_tiles.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.property_tiles.arn}/property_prices.pmtiles"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "pmtiles_cors" {
  bucket = aws_s3_bucket.property_tiles.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET"]
    allowed_origins = ["*"]
    expose_headers  = ["Content-Length", "ETag", "Content-Range"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_ownership_controls" "object_ownership" {
  bucket = aws_s3_bucket.property_tiles.id
  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_object" "pmtiles_file" {
  bucket       = aws_s3_bucket.property_tiles.id
  key          = "property_prices_v3.pmtiles"
  source       = "path/to/local/property_prices_v3.pmtiles"
  acl          = "public-read"
  content_type = "application/x-protomaps-pmtiles3"
  etag         = filemd5("path/to/local/property_prices_v3.pmtiles")
}

output "pmtiles_url" {
  value = "https://${aws_s3_bucket.property_tiles.bucket_regional_domain_name}/${aws_s3_object.pmtiles_file.key}"
} 