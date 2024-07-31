

function calculateApiUsage(price, billingUnit, usage, billingBy) {
 
 
  const total_cost = (+usage / +billingUnit) * parseFloat(price) 

  return total_cost.toFixed(10)
}

module.exports = calculateApiUsage