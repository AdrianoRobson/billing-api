

function calculateApiUsage(price, billingUnit, usage, billingBy) {
  let _billingUnit = +billingUnit

  if (billingBy == 'minute')
    _billingUnit = 60 * _billingUnit 

  const total_cost = (+usage / _billingUnit) * parseFloat(price) 

  return total_cost.toFixed(10)
}

module.exports = calculateApiUsage