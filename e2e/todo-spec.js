describe('angularjs homepage todo list', function() {
  it('should add a todo', function() {
    browser.get('http://localhost:3000/#/pages/features');
    var completedAmount = element.all(by.css('.feature-cellItemForPro'));
    expect(completedAmount.count()).toEqual(4);
  });
});