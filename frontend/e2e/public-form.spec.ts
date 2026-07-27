import { test, expect } from "@playwright/test";

test.describe("Public Smart Form E2E Flow", () => {
  test("completes 5-step loan application form successfully", async ({ page }) => {
    // Intercept backend submit API endpoint
    await page.route("**/api/v1/loan-applications/submit", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          status: "success",
          message: "Loan application submitted successfully",
          loan_application_id: 999,
          customer_id: 123,
          core_task_id: 456,
        }),
      });
    });

    // Intercept NID validation endpoint
    await page.route("**/api/v1/nid-validation/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          nid: "001-0000001-1",
          first_name: "Juan",
          last_name: "Pérez Rodríguez",
        }),
      });
    });

    // 1. Navigate to public solicitar page
    await page.goto("/solicitar");

    // Expect Step 1 header
    await expect(page.locator("h2")).toContainText("Paso 1: Identificación");

    // Fill Step 1
    await page.fill("#identity-nid", "001-0000001-1");
    await page.fill("#identity-firstname", "Juan");
    await page.fill("#identity-lastname", "Pérez Rodríguez");
    await page.fill("#identity-phone", "8095550001");
    await page.fill("#identity-email", "juan.perez@gmail.com");

    await page.click("button:has-text('Continuar a Perfil y Vivienda')");

    // Expect Step 2
    await expect(page.locator("h2")).toContainText("Paso 2: Perfil y Vivienda");

    await page.selectOption("#marital-status", "MARRIED");
    await page.selectOption("#education-level", "UNIVERSITY");
    await page.selectOption("#housing-type", "RENTED");

    // Check conditional housing payment field appeared
    await expect(page.locator("#housing-payment")).toBeVisible();
    await page.fill("#housing-payment", "12000");

    await page.fill("#residence-time", "24");
    await page.fill("#dependents-count", "2");

    await page.click("button:has-text('Continuar a Empleo')");

    // Expect Step 3
    await expect(page.locator("h2")).toContainText("Paso 3: Información Laboral");

    await page.selectOption("#occupation-type", "EMPLOYED");
    await page.fill("#job-role", "Analista Senior");
    await page.fill("#company-name", "Banco BHD León");
    await page.fill("#job-salary", "55000");
    await page.selectOption("#payment-bank", "BHD");

    await page.click("button:has-text('Continuar a Situación Financiera')");

    // Expect Step 4
    await expect(page.locator("h2")).toContainText("Paso 4: Situación Financiera");

    await page.fill("#other-income", "8000");
    await page.fill("#other-income-source", "RENT");
    await page.check("#has-vehicle-check");

    await page.click("button:has-text('Continuar a Solicitud')");

    // Expect Step 5
    await expect(page.locator("h2")).toContainText("Paso 5: Solicitud y Autorización Legal");

    await page.fill("#loan-amount", "100000");
    await page.selectOption("#loan-term", "24");
    await page.selectOption("#loan-purpose", "RENOVATION");

    // Check legal consent checkbox
    await page.check("#legal-consent-all");

    // Submit form
    await page.click("button:has-text('Enviar Solicitud de Préstamo')");

    // Verify confirmation screen
    await expect(page.locator("h1")).toContainText("¡Solicitud Recibida con Éxito!");
  });
});
