export const plans = [
    {
      id: "starter",
      title: "Starter",
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: "Perfect for small local businesses",
      minutesAllowed: 100,
      basePrice: 0,
      pricePerMinute: 0.15,
      features: [
        "Pay only for what you use",
        "Standard voices",
        "Basic call routing",
        "Email support"
      ],
    },
    {
      id: "enterprise",
      title: "Enterprise",
      description: "Custom solutions for large organizations",
      features: ["Way more minutes", "Custom integrations/features", "The latest tech the fastest"],
      minutesAllowed: 999999, // Effectively unlimited
    },
  ]