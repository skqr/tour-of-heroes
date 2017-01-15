import {ResourceDbService} from './jsonApi.service';
import {JsonApiResModel} from './jsonApi';


class MockResModel implements JsonApiResModel {
    constructor(
        public id: string,
        public someProp?: string
    ) {}
}


// Straight Jasmine - no imports from Angular test libraries
describe('The service that stores resource models', () => {
  let service: ResourceDbService;

  beforeEach(() => { service = new ResourceDbService(); });

  it('should ', () => {
    let mockResModel = new MockResModel('some-id', 'Some prop.');
    service.addResource('some-type', mockResModel);
    expect(service.getResource('some-type', 'some-id')).toBe(mockResModel);
  });

  // it('#getAsyncValue should return async value', done => {
  //   service.getAsyncValue().then(value => {
  //     expect(value).toBe('async value');
  //     done();
  //   });
  // });
  //
  // it('#getTimeoutValue should return timeout value',  done => {
  //   service = new FancyService();
  //   service.getTimeoutValue().then(value => {
  //     expect(value).toBe('timeout value');
  //     done();
  //   });
  // });
  //
  // it('#getObservableValue should return observable value', done => {
  //   service.getObservableValue().subscribe(value => {
  //     expect(value).toBe('observable value');
  //     done();
  //   });
  // });
});
