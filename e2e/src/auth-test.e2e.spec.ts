import { browser, logging, element, by } from 'protractor';
import { AppPage } from './app.po';
import { protractor } from 'protractor';

describe("Router: App", () => {

  let page: AppPage;
  const ec = protractor.ExpectedConditions;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('unauthenticated navigate to "/" redirects you to /login', () => {
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login');
  });

  it('unauthenticated navigate to "home" takes you to /login', () => {
    browser.get(browser.baseUrl + 'home');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login');
  });

  it('unauthenticated navigate to "email-confirm" takes you to /login', () => {
    browser.get(browser.baseUrl + 'email-confirm');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login');
  });

  it('unauthenticated navigate to "register" takes you to /register', () => {
    browser.get(browser.baseUrl + 'register');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'register');
  });

  it('unauthenticated navigate to "**" takes you to /login', () => {
    browser.get(browser.baseUrl + 'some-undefined-route');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login');
  });

  it('authenticated navigate to "" takes you to /home', () => {
    // Need a default test user this is temporary
    element(by.css('#inputUsername')).sendKeys('messageman1');
    element(by.css('#inputPassword')).sendKeys('password1!');
    element(by.css('#loginButton')).click();
    browser.wait(ec.urlContains('home'), 1000);
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'home');
    logout();
  });

  it('authenticated navigate to "login" takes you to /home', () => {
    // Need a default test user this is temporary
    element(by.css('#inputUsername')).sendKeys('messageman1');
    element(by.css('#inputPassword')).sendKeys('password1!');
    element(by.css('#loginButton')).click()
    browser.wait(ec.urlContains('home'), 1000);
    browser.get(browser.baseUrl + 'login');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'home');
    logout();
  });

  it('authenticated navigate to "register" takes you to /home', () => {
    // Need a default test user this is temporary
    element(by.css('#inputUsername')).sendKeys('messageman1');
    element(by.css('#inputPassword')).sendKeys('password1!');
    element(by.css('#loginButton')).click()
    browser.wait(ec.urlContains('home'), 1000);
    browser.get(browser.baseUrl + 'register');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'home');
    logout();
  });

  it('valid username with invalid password fails to authenticate and prompts "did not match" toast', () => {
    element(by.css('#inputUsername')).sendKeys('messageman1');
    element(by.css('#inputPassword')).sendKeys('password1!!!!!!');
    element(by.css('#loginButton')).click()
    expect(element(by.css('.toast-message')).getText()).toBe(
      'The username and password you entered did not match our records. Please double-check and try again.'
    );
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login');
  });

  it('invalid username/password fails to authenticate and prompts "did not match" toast', () => {
    element(by.css('#inputUsername')).sendKeys('messageman1231321ok');
    element(by.css('#inputPassword')).sendKeys('password1!');
    element(by.css('#loginButton')).click()
    expect(element(by.css('.toast-message')).getText()).toBe(
      'The username and password you entered did not match our records. Please double-check and try again.'
    );
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login');
  });

  it('register with already registered username fails and prompts "username already exists" in toast', () => {
    browser.get(browser.baseUrl + 'register');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'register')
    element(by.css('#inputEmail')).sendKeys('dev.email.kol@gmail.com');
    element(by.css('#inputUsername')).sendKeys('messageman1');
    element(by.css('#inputPassword')).sendKeys('password1!');
    element(by.css('#registerButton')).click()
    expect(element(by.css('.toast-message')).getText()).toBe(
      'Please fix the following:\nA user with that username already exists.'
    );
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'register');
  });

  it('register with improperly formatted email fails and prompts "enter valid email" in toast', () => {
    browser.get(browser.baseUrl + 'register');
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'register')
    element(by.css('#inputEmail')).sendKeys('dev.email.kol');
    element(by.css('#inputUsername')).sendKeys('newuser');
    element(by.css('#inputPassword')).sendKeys('password1!');
    element(by.css('#registerButton')).click()
    expect(element(by.css('.toast-message')).getText()).toBe(
      'Please fix the following:\nEnter a valid email address.'
    );
    expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'register');
  });

  function logout() {
    element(by.css('#logoutLink')).click().then(() =>
      expect(browser.getCurrentUrl()).toBe(browser.baseUrl + 'login')
    )
  }

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });

});
