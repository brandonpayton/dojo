define([
	'intern!object',
	'intern/chai!assert',
	'intern/dojo/aspect',
	'dojo/topic'
], function (registerSuite, assert, topic) {
	var aspectHandle,
		subscriptionHandles = [];

	registerSuite({
		name: 'dojo/topic',

		before: function () {
			aspectHandle = aspect.after(topic, 'subscribe', function (handle) {
				subscriptionHandles.push(handle);
			}, true);
		},

		after: function () {
			aspectHandle.remove();
		},

		afterEach: function () {
			while (subscriptionHandles.length > 0) {
				subscriptionHandles.pop().remove();
			}
		},

		'subscribe and publish': function () {
			var listenerCallCount = 0,
				expectedArgument;
			topic.subscribe('/test/foo', function (event) {
				assert.strictEqual(event, expectedArgument);
				listenerCallCount++;
			});

			expectedArgument = 'bar';
			topic.publish('/test/foo', expectedArgument);
			assert.strictEqual(listenerCallCount, 1);

			expectedArgument = 'baz';
			topic.publish('/test/foo', expectedArgument);
			assert.strictEqual(listenerCallCount, 2);
		},

		'unsubscribe': function () {
			var listenerCalled = false;

			var handle = topic.subscribe('/test/foo', function () {
				listenerCalled = true;
			});
			handle.remove();

			topic.publish('/test/foo', 'bar');
			assert.strictEqual(listenerCalled, true, 'Expected `remove` to stop calls to the listener.');
		},

		'publish argument arity': function () {
			var publishArguments = [ '/test/topic' ],
				actualArguments;

			topic.subscribe('/test/topic', function () {
				actualArguments = Array.prototype.slice(arguments);
			});

			for (var i = 0; i <= 5; ++i) {
				if (i > 0) {
					publishArguments.push({ value: 'value-' + i });
				}

				topic.publish.apply(topic, publishArguments);
				assert.equal(actualArguments.length, i);
				assert.deepEqual(actualArguments, publishArguments.slice(1));
			}
		}
	});
});
