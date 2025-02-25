import { browser, by, ExpectedConditions as EC } from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import editFlowPage from '../../page-objects/flows/editFlow';
import stepsPage from '../../page-objects/steps/steps';
import ingestStepPage from '../../page-objects/steps/ingestStep';
import mappingStepPage from '../../page-objects/steps/mappingStep';
import masteringStepPage from '../../page-objects/steps/masteringStep';
import manageJobsPage from '../../page-objects/jobs/manageJobs';
import jobDetailsPage from '../../page-objects/jobs/jobDetails';
import browsePage from '../../page-objects/browse/browse';

export default function(qaProjectDir) {
    describe('E2E Simple JSON', () => {
        beforeAll(() => {
          browser.refresh();
        });

        xit('should login and go to entities page', async function() {
            //await loginPage.browseButton.click();
            await loginPage.setCurrentFolder(qaProjectDir);
            await loginPage.clickNext('ProjectDirTab');
            browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
            await loginPage.clickNext('EnvironmentTab');
            browser.wait(EC.visibilityOf(loginPage.loginTab));
            await loginPage.login();
            dashboardPage.isLoaded();
        });

        it ('should create SimpleJSON entity', async function() {
            await appPage.entitiesTab.click();
            browser.wait(EC.visibilityOf(entityPage.toolsButton));
            await entityPage.toolsButton.click();
            await entityPage.newEntityButton.click();
            await entityPage.entityTitle.sendKeys('SimpleJSON');
            let lastProperty = entityPage.lastProperty;
            // add id property
            await entityPage.addProperty.click();
            await entityPage.getPropertyName(lastProperty).sendKeys('id');
            await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
            // add firstname property
            await entityPage.addProperty.click();
            lastProperty = entityPage.lastProperty;
            await entityPage.getPropertyName(lastProperty).sendKeys('firstname');
            await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
            // add lastname property
            await entityPage.addProperty.click();
            lastProperty = entityPage.lastProperty;
            await entityPage.getPropertyName(lastProperty).sendKeys('lastname');
            await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
            await entityPage.saveEntity.click();
            browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
            await entityPage.confirmDialogYesButton.click();
            browser.wait(EC.visibilityOf(entityPage.getEntityBox('SimpleJSON')));
            await entityPage.toolsButton.click();
        });

        it('should create SimpleJSON Flow', async function() {
            await appPage.flowsTab.click();
            await manageFlowPage.clickNewFlowButton();
            browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
            await manageFlowPage.setFlowForm("name", "SimpleJSONFlow");
            await manageFlowPage.clickFlowCancelSave("save");
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await expect(manageFlowPage.flowName("SimpleJSONFlow").getText()).toEqual("SimpleJSONFlow");
        });

        it('should create ingestion step and run the flow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickFlowname("SimpleJSONFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
            await stepsPage.clickStepTypeOption("Ingestion");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("SimpleJSONIngest");
            await stepsPage.setStepDescription("Ingest SimpleJSON docs");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("SimpleJSONIngest");
            await ingestStepPage.setInputFilePath(qaProjectDir + "/input/mastering-data");
            browser.sleep(3000);
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickLastJobFinished("SimpleJSONFlow");
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleJSONFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("SimpleJSONIngest").getText()).toEqual("SimpleJSONIngest");
            await expect(jobDetailsPage.stepStatus("SimpleJSONIngest").getText()).toEqual("Completed step 1");
            await expect(jobDetailsPage.stepCommitted("SimpleJSONIngest").getText()).toEqual("6");   
            await jobDetailsPage.clickStepCommitted("SimpleJSONIngest");
            // Verify on Browse Data page
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 6 of 6');
            await expect(browsePage.facetName("SimpleJSONIngest").getText()).toEqual("SimpleJSONIngest");
            // Verify on Manage Flows page
            await appPage.flowsTab.click()
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await expect(manageFlowPage.status("SimpleJSONFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("SimpleJSONFlow").getText()).toEqual("6");
        });

        it('should create mapping step and run the flow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickFlowname("SimpleJSONFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
            await stepsPage.clickStepTypeOption("Mapping");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("SimpleJSONMapping");
            await stepsPage.setStepDescription("Mapping SimpleJSON docs");
            await stepsPage.clickSourceTypeRadioButton("collection");
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
            await stepsPage.clickStepSourceCollectionDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("SimpleJSONIngest")));
            await stepsPage.clickStepSourceCollectionOption("SimpleJSONIngest");
            await stepsPage.clickStepTargetEntityDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("SimpleJSON")));
            browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("SimpleJSON");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Mapping the source to entity
            // Map prop1 to id
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("id")));
            await mappingStepPage.clickSourcePropertyContainer("id");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickMapSourceProperty("prop1", "id");
            // Map prop2 to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("firstname")));
            await mappingStepPage.clickSourcePropertyContainer("firstname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickMapSourceProperty("prop2", "firstname");
            // Map prop3 to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("lastname")));
            await mappingStepPage.clickSourcePropertyContainer("lastname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickMapSourceProperty("prop3", "lastname");
            browser.sleep(10000);
            // Redeploy
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickRedeployButton();
            browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            browser.sleep(15000);
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickFlowname("SimpleJSONFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("SimpleJSONMapping");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickLastJobFinished("SimpleJSONFlow");
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleJSONFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("SimpleJSONMapping").getText()).toEqual("SimpleJSONMapping");
            await expect(jobDetailsPage.stepStatus("SimpleJSONMapping").getText()).toEqual("Completed step 2");
            await expect(jobDetailsPage.stepCommitted("SimpleJSONMapping").getText()).toEqual("6");   
            await jobDetailsPage.clickStepCommitted("SimpleJSONMapping");
            // Verify on Browse Data page
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 6 of 6');
            await expect(browsePage.facetName("SimpleJSONMapping").getText()).toEqual("SimpleJSONMapping");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await expect(manageFlowPage.status("SimpleJSONFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("SimpleJSONFlow").getText()).toEqual("6");
        });

        it('should create mastering step and run the flow', async function() {
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickFlowname("SimpleJSONFlow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await stepsPage.clickStepSelectContainer("SimpleJSONMapping");
            await editFlowPage.clickNewStepButton();
            await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mastering")));
            await stepsPage.clickStepTypeOption("Mastering");
            await browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("SimpleJSONMastering");
            await stepsPage.setStepDescription("Mastering SimpleJSON docs");
            await stepsPage.clickSourceTypeRadioButton("collection");
            await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
            await stepsPage.clickStepSourceCollectionDropDown();
            await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("SimpleJSONMapping")));
            await stepsPage.clickStepSourceCollectionOption("SimpleJSONMapping");
            await stepsPage.clickStepTargetEntityDropDown();
            await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("SimpleJSON")));
            await browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("SimpleJSON");
            await stepsPage.clickStepCancelSave("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("SimpleJSONMastering");
            // Configure matching and merging
            // Add matching option for id
            await masteringStepPage.clickMatchOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("id")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("id");
            await masteringStepPage.setMatchOptionDialogWeight(10);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            await browser.sleep(3000);
            // Add matching threshold
            await masteringStepPage.clickMatchThresholdsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
            await masteringStepPage.setMatchThresholdDialogName("DefiniteMatch");
            await masteringStepPage.setMatchThresholdDialogWeight(5);
            await masteringStepPage.clickMatchThresholdDialogActionMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Merge")));
            await masteringStepPage.clickMatchThresholdDialogActionOptions("Merge");
            await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Redeploy
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickRedeployButton();
            await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            await browser.sleep(15000);
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickFlowname("SimpleJSONFlow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("SimpleJSONMastering");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickLastJobFinished("SimpleJSONFlow");
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleJSONFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("SimpleJSONMastering").getText()).toEqual("SimpleJSONMastering");
            await expect(jobDetailsPage.stepStatus("SimpleJSONMastering").getText()).toEqual("Completed step 3");
            await expect(jobDetailsPage.stepCommitted("SimpleJSONMastering").getText()).toEqual("6");   
            await jobDetailsPage.clickStepCommitted("SimpleJSONMastering");
            // Verify on Browse Data page
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await browser.sleep(5000);
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 8 of 8');
            await expect(browsePage.facetName("SimpleJSONMastering").getText()).toEqual("SimpleJSONMastering");
            await expect(browsePage.facetName("mdm-merged").getText()).toEqual("mdm-merged");
            await expect(browsePage.facetCount("mdm-merged").getText()).toEqual("1");
            await expect(browsePage.facetCount("mdm-auditing").getText()).toEqual("1");
            await expect(browsePage.facetCount("mdm-archived").getText()).toEqual("3");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await expect(manageFlowPage.status("SimpleJSONFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("SimpleJSONFlow").getText()).toEqual("6");
        });

        it('should list SimpleJSONFlow jobs', async function() {
            await appPage.jobsTab.click();
            browser.wait(EC.visibilityOf(manageJobsPage.jobsPageHeader));
            await manageJobsPage.clickFlowNameFilter();
            browser.wait(EC.elementToBeClickable(manageJobsPage.flowNameFilterOptions("SimpleJSONFlow")));
            await manageJobsPage.clickFlowNameFilterOptions("SimpleJSONFlow");
            await manageJobsPage.getJobsCount("SimpleJSONFlow").then(function(jobs){expect(jobs >= 3)});
        });

        // Cleanup

        it('should delete SimpleJSON Flow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
            await manageFlowPage.clickFlowMenu("SimpleJSONFlow");
            browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
            browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
            await manageFlowPage.clickFlowMenuOption("delete");
            browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
            await manageFlowPage.clickDeleteConfirmationButton("YES");
            browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
            browser.wait(EC.invisibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
        });

        it ('should delete SimpleJSON entity', async function() {
            await appPage.entitiesTab.click();
            browser.wait(EC.visibilityOf(entityPage.toolsButton));
            await entityPage.clickDeleteEntity('SimpleJSON');
            browser.sleep(3000);
            browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
            await entityPage.confirmDialogYesButton.click();
        });
    });
}
