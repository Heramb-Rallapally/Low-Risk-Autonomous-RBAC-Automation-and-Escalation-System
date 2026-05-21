const evaluateRisk = async ({
    user,
    resource,
    policy,
    requestedAccess,
    durationDays
}) => {

    // Department validation
    if (
        !policy.allowedDepartments.includes(user.department)
    ) {

        return {
            decision: "REJECT",
            riskScore: 90,
            reason: "User department is not authorized for this resource"
        };

    }

    // Access level validation
    if (
        !policy.allowedAccessLevels.includes(requestedAccess)
    ) {

        return {
            decision: "REJECT",
            riskScore: 85,
            reason: "Requested access level is not permitted"
        };

    }

    // Duration validation
    if (
        durationDays > policy.maxDurationDays
    ) {

        return {
            decision: "ESCALATE",
            riskScore: 65,
            reason: "Requested duration exceeds allowed policy duration"
        };

    }

    // Critical production resources
    if (
        resource.environment === "production" &&
        resource.sensitivityLevel === "critical"
    ) {

        return {
            decision: "ESCALATE",
            riskScore: 80,
            reason: "Critical production resource requires manager approval"
        };

    }

    // Policy-based approval requirement
    if (policy.requiresManagerApproval) {

        return {
            decision: "ESCALATE",
            riskScore: 70,
            reason: "Manager approval required by policy"
        };

    }

    // Default low-risk approval
    return {
        decision: "APPROVE",
        riskScore: 20,
        reason: "Low-risk request compliant with policy"
    };

};

module.exports = evaluateRisk;