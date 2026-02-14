"""
Validation utilities for Dominican Republic data standards.
"""
import re


def validate_dominican_nid(nid: str) -> bool:
    """
    Validate Dominican Republic National ID format.
    
    Args:
        nid: National ID to validate
    
    Returns:
        True if valid (exactly 11 digits), False otherwise
    
    Examples:
        >>> validate_dominican_nid("12345678901")
        True
        >>> validate_dominican_nid("123")
        False
        >>> validate_dominican_nid("123-4567-8901")
        False
    """
    return bool(re.match(r"^\d{11}$", nid))


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
