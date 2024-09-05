export const plans = [
    {
      id: "starter",
      title: "Starter",
      monthlyPrice: 49,
      yearlyPrice: 490,
      description: "Perfect for small businesses",
      features: ["Up to 100 minutes/month", "Basic call routing", "Email support"],
      minutesAllowed: 100,
    },
    {
      id: "professional",
      title: "Professional",
      monthlyPrice: 99,
      yearlyPrice: 990,
      description: "Ideal for growing companies",
      features: ["Up to 500 minutes/month", "Advanced call routing", "Priority support"],
      minutesAllowed: 500,
    },
    {
      id: "enterprise",
      title: "Enterprise",
      description: "Custom solutions for large organizations",
      features: ["Unlimited minutes", "Custom integrations", "Dedicated account manager"],
      minutesAllowed: 999999, // Effectively unlimited
    },
  ]