
﻿namespace EQUI.DREAMS.CRM.Models;

/// <summary>
/// Represents an email address associated with an account in the CRM system.
/// This class holds the details of the email address, including its validation status,
/// and the user who entered the information, along with related timestamps.
/// </summary>
public class AccountEmailAddress
{
    /// <summary>
    /// Gets or sets the unique identifier for the email address entry.
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the account associated with this email address.
    /// </summary>
    public long AccountId { get; set; }
    
    /// <summary>
    /// Gets or sets the email address.
    /// This property is a string that represents the actual email value and defaults to an empty string.
    /// </summary>
    public string EmailAddress { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether this email address is the primary email for the account.
    /// This property is nullable, indicating that the primary status may not be defined.
    /// </summary>
    public bool? EmailPrimary { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the account has opted out of email communications.
    /// This property is nullable, which means it can hold a value of true, false, or null.
    /// </summary>
    public bool? OptedOut { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the email address is considered invalid.
    /// This property is nullable, allowing it to represent multiple states of validity.
    /// </summary>
    public bool? Invalid { get; set; }

    /// <summary>
    /// Gets or sets the username or identifier of the user who entered the email address information.
    /// This property is a string that defaults to an empty string.
    /// </summary>
    public string EnteredBy { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date and time when the email address information was entered into the system.
    /// </summary>
    public DateTime EnteredDate { get; set; }

    /// <summary>
    /// Gets or sets the IP address from which the email address information was entered.
    /// This property is a string that defaults to an empty string.
    /// </summary>
    public string EnteredByIp { get; set; } = string.Empty;
}
