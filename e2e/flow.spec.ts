import { test, expect } from "@playwright/test";

test.describe("InterviewIQ AI Public Flow", () => {
  test("Landing Page renders successfully and has correct headings and CTAs", async ({ page }) => {
    // Navigate to landing page
    await page.goto("/");

    // Verify main title
    const mainHeading = page.locator("h1");
    await expect(mainHeading).toContainText("Master your next tech interview");

    // Verify presence of navigation elements
    const brandName = page.getByRole("banner").getByText("InterviewIQ AI");
    await expect(brandName).toBeVisible();

    // Verify navigation links
    const featuresLink = page.getByRole("navigation").getByText("Features");
    await expect(featuresLink).toBeVisible();

    // Verify main Call To Action button
    const ctaButton = page.getByRole("button", { name: "Start Practicing Free" });
    await expect(ctaButton).toBeVisible();
  });

  test("Login Page renders and shows OAuth provider buttons", async ({ page }) => {
    // Navigate directly to login
    await page.goto("/login");

    // Verify login card title
    const cardTitle = page.locator("h3");
    await expect(cardTitle).toContainText("Welcome Back");

    // Verify Google sign-in button
    const googleButton = page.locator("text=Sign in with Google");
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toBeEnabled();

    // Verify GitHub sign-in button
    const githubButton = page.locator("text=Sign in with GitHub");
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toBeEnabled();
  });
});
