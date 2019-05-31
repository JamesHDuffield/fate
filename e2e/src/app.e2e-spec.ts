import { AppPage } from './app.po';
// tslint:disable-next-line: no-implicit-dependencies
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  afterEach(async () => {
    console.log(page);
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage()
      .logs()
      .get(logging.Type.BROWSER);
    return expect(logs).not
      .toContain(
        jasmine.objectContaining({
          level: logging.Level.SEVERE,
        }),
      );
  });
});
