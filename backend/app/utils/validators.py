"""
Validation utilities for Dominican Republic data standards.
"""
import re


def validate_dominican_nid(nid: str) -> bool:
    """
    Validate Dominican Republic National ID (Cédula) format and checksum.
    
    Implements official JCE Modulo 10 (Luhn) check digit algorithm and filters
    invalid repeat-digit sequences (e.g. 00000000000).
    
    Args:
        nid: National ID to validate (with or without dashes)
    
    Returns:
        True if valid Dominican NID, False otherwise
    """
    if not nid:
        return False
    
    cleaned = re.sub(r"\D", "", nid)
    if len(cleaned) != 11:
        return False
    
    # Reject uniform repeated digits (00000000000, 11111111111, etc.)
    if re.match(r"^(\d)\1{10}$", cleaned):
        return False
    
    multipliers = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
    total = 0
    
    for i in range(10):
        digit = int(cleaned[i])
        prod = digit * multipliers[i]
        if prod >= 10:
            prod = (prod // 10) + (prod % 10)
        total += prod
    
    check_digit = (10 - (total % 10)) % 10
    actual_check_digit = int(cleaned[10])
    
    return check_digit == actual_check_digit


def validate_dominican_phone(phone: str) -> bool:
    """
    Validate Dominican phone format.
    
    Args:
        phone: Phone number to validate
    
    Returns:
        True if valid (exactly 10 digits), False otherwise
    
    Examples:
        >>> validate_dominican_phone("8091234567")
        True
        >>> validate_dominican_phone("123")
        False
        >>> validate_dominican_phone("809-123-4567")
        False
    """
    return bool(re.match(r"^\d{10}$", phone))
