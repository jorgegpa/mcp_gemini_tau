import { test, expect } from 'vitest';
import { chromium } from 'playwright';
import * as allure from "allure-js-commons";

test('Login exitoso en SauceDemo', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await allure.description("Validar que un usuario estándar puede loguearse.");
  
  await page.goto('https://www.saucedemo.com/');
  await page.locator('[data-test="username"]').fill('standard_user');
  await page.locator('[data-test="password"]').fill('secret_sauce');
  await page.locator('[data-test="login-button"]').click();

  // Verificamos que entramos a la página de productos
  const inventoryVisible = await page.isVisible('.inventory_list');
  expect(inventoryVisible).toBe(true);

  await browser.close();
});