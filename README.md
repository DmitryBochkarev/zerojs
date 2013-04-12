#Zerojs

Sometimes you just need simple dependencies detections system.
That is all.

##Documentation

###Helpers

*noop()* just return pssing value.
*uuid()* generate unique number.
*deffered(delay, function)* call function once in delay interval, every next call reset timeout. Call context saved.

###Set(initialCollection)

Create set of unique elements.
*add(element)* add element in set.
*has(element)* return true if collection has passing element.
*remove(element)* remove passing element from set.
*clear()* remove all elements from collection.
*elements* array of set elements.

###EventHandler(function, runOnce)

This class used by event emitter.

###EventEmmiter()

*on(eventName, handler)* register `handler` to `eventName` event.
*once(eventName, handler)* register `handler` to `eventName` event after first call of event hadler remove from collection.
*off(




