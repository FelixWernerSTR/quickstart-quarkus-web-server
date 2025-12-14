import { ref } from 'vue';

const JAVA_CODE = `
package de.svi.monitor;

import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import java.util.concurrent.TimeUnit;
import static org.junit.jupiter.api.Assertions.*;

/**
 * JUnit Testklasse zur Validierung der Endpoint Monitor Webanwendung
 * unter Verwendung von Selenium WebDriver.
 */
public class EndpointMonitorTest {

    private WebDriver driver;
    private final String BASE_URL = "http://localhost:8080/monitor"; // Actual app URL

    @BeforeEach
    public void setup() {
        // Setup WebDriver executable path (e.g., using System Property or WebDriverManager)
        // System.setProperty("webdriver.chrome.driver", "/path/to/chromedriver");
        driver = new ChromeDriver();
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
        driver.get(BASE_URL);
    }

    @AfterEach
    public void teardown() {
        if (driver != null) {
            driver.quit();
        }
    }

    /**
     * Testfall 1: Navigation zwischen den Haupt-Views
     */
    @Test
    public void testNavigation() {
        System.out.println("--- Executing Test 1: Navigation ---");

        // 1. Start auf Monitor View (Default)
        WebElement monitorHeader = driver.findElement(By.xpath("//h2[text()='Health Monitor']"));
        assertTrue(monitorHeader.isDisplayed(), "Monitor View sollte sichtbar sein.");

        // 2. Navigiere zu Konfiguration
        driver.findElement(By.xpath("//nav//button[text()='Konfiguration']")).click();
        WebElement configHeader = driver.findElement(By.xpath("//h2[text()='Konfiguration']"));
        assertTrue(configHeader.isDisplayed(), "Configuration View sollte sichtbar sein.");

        // 3. Navigiere zu Selenium Test View
        driver.findElement(By.xpath("//nav//button[contains(text(),'Selenium-Test')]")).click();
        WebElement seleniumHeader = driver.findElement(By.xpath("//h2[text()='Selenium Test (Java Code View)']"));
        assertTrue(seleniumHeader.isDisplayed(), "Selenium View sollte sichtbar sein.");
    }

    /**
     * Testfall 2: Hinzufügen und Löschen eines Endpunktes
     */
    @Test
    public void testEndpointLifecycle() {
        System.out.println("--- Executing Test 2: Endpoint Lifecycle ---");

        // Navigiere zur Konfiguration
        driver.findElement(By.xpath("//nav//button[text()='Konfiguration']")).click();

        final String testName = "ft"; // Use a unique name not in defaults
        final String testHost = "svis.ft.sv.loc";
        
        // --- Hinzufügen ---
        driver.findElement(By.id("ep_name")).sendKeys(testName);
        driver.findElement(By.id("ep_host")).sendKeys(testHost);
        driver.findElement(By.xpath("//button[text()='Hinzufügen']")).click();

        // Validierung der Hinzufügung
        WebElement addedItemName = driver.findElement(By.xpath("//strong[text()='" + testName + "']"));
        assertTrue(addedItemName.isDisplayed(), "Neuer Endpunkt sollte in der Liste sichtbar sein.");
        
        // --- Löschen ---
        // Finde den Lösch-Button basierend auf dem hinzugefügten Endpunkt
        WebElement deleteButton = addedItemName.findElement(By.xpath("./ancestor::div[@class='entity-item']//button[text()='Löschen']"));
        deleteButton.click();
        
        // Handle Bestätigungsdialog (localStorage Speicherung wird in der App simuliert)
        driver.switchTo().alert().accept(); 

        // Validierung der Löschung
        assertFalse(driver.findElements(By.xpath("//strong[text()='" + testName + "']")).size() > 0, "Endpunkt sollte gelöscht worden sein.");
    }

    /**
     * Testfall 3: Validierung grundlegender UI-Funktionalitäten im Health Monitor
     */
    @Test
    public void testHealthMonitorFunctionality() throws InterruptedException {
        System.out.println("--- Executing Test 3: Health Monitor Functionality ---");
        
        // Navigiere zum Monitor (sicherstellen, dass wir im richtigen View sind)
        driver.findElement(By.xpath("//nav//button[text()='Health-Monitor']")).click();

        // Warte, bis der erste Auto-Refresh erfolgt ist (oder bis Ladeanzeige verschwindet)
        TimeUnit.SECONDS.sleep(2); 

        // Prüfe, ob mindestens eine Status-Kachel vorhanden ist (Standardkonfigurationen)
        WebElement sampleCard = driver.findElement(By.xpath("//h3[text()='et']/ancestor::div[contains(@class, 'card')]"));
        assertTrue(sampleCard.isDisplayed(), "Mindestens eine Endpunkt-Kachel muss sichtbar sein.");

        // Teste Details anzeigen/ausblenden
        WebElement detailsButton = sampleCard.findElement(By.xpath(".//button[contains(text(),'Details anzeigen')]"));
        detailsButton.click();
        
        WebElement detailsContent = sampleCard.findElement(By.xpath(".//div[contains(text(), 'Details:')]"));
        assertTrue(detailsContent.isDisplayed(), "Details-Inhalt sollte nach Klick sichtbar sein.");

        detailsButton.click();
        assertFalse(detailsContent.isDisplayed(), "Details-Inhalt sollte nach erneutem Klick ausgeblendet sein.");


        // Teste Manuelles Aktualisieren
        WebElement refreshButton = driver.findElement(By.xpath("//button[text()='Aktualisieren']"));
        refreshButton.click();
        
        // Optional: Warte, bis der Button wieder aktiv ist (implizites Warten kann dies abdecken)
        // assertTrue(refreshButton.isEnabled(), "Button sollte nach dem Aktualisieren wieder aktiv sein.");
        System.out.println("Manuelle Aktualisierung initiiert und abgeschlossen.");
        
        // Validiere Footer Text
        WebElement footer = driver.findElement(By.tagName("footer"));
        assertEquals("Bereitgestellt von SVI, Version v1.0", footer.getText());
    }
}
`;


export default {
    setup() {
        return { JAVA_CODE };
    },
    template: `
        <div class="selenium-test">
            <h2>Selenium Test (Java Code View)</h2>
            <p>Dies ist der vorgeschlagene Java-Code, um die Funktionalität des Endpoint Monitors mithilfe von Selenium und JUnit zu testen.</p>
            <pre><code>{{ JAVA_CODE }}</code></pre>
        </div>
    `
};

