Feature: Home page
  As a visitor
  I want to see the landing page
  So that I can start login

  Scenario: Home shows login link
    Given I load the home view markup
    Then it contains the title "Este no es el UNAChat!"
    And it contains a login link to "/login"
