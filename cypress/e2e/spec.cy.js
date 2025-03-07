describe('My first Test', () => {
  it('Does not do much!', () => {
    expect(true).to.equal(true)
  })

  it('Visits the page', () => {
    cy.visit('/')

    cy.contains('Sign in').click()

    cy.url().should('include', '/signin')

    cy.get('[data-testid=email').type('fake@email.com')

    cy.get('[data-testid=email').should('have.value', 'fake@email.com')

    cy.get('[data-testid=password').type('123456Aa')

    cy.get('[data-testid=password').should('have.value', '123456Aa')

    cy.url().should('include', '/signin')
  })
})