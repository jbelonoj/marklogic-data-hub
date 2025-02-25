const mastering = require("/com.marklogic.smart-mastering/process-records.xqy");
const mergeImpl = require("/com.marklogic.smart-mastering/survivorship/merging/base.xqy");
const masteringCollections = require("/com.marklogic.smart-mastering/impl/collections.xqy");
const masteringConsts = require("/com.marklogic.smart-mastering/constants.xqy");
const requiredOptionProperties = ['matchOptions', 'mergeOptions'];
const emptySequence = Sequence.from([]);

function main(content, options) {
  const filteredContent = [];
  checkOptions(content, options, filteredContent);
  let mergeOptions = new NodeBuilder().addNode({ options: options.mergeOptions }).toNode();
  let matchOptions = new NodeBuilder().addNode({ options: options.matchOptions }).toNode();
  // Data Hub will persist the results for us.
  let persistResults = false;
  if (filteredContent.length) {
    return mastering.processMatchAndMergeWithOptions(Sequence.from(filteredContent), mergeOptions, matchOptions, cts.trueQuery(), persistResults);
  } else {
    return emptySequence;
  }
}

function checkOptions(content, options, filteredContent = []) {
  let hasRequiredOptions = requiredOptionProperties.every((propName) => !!options[propName]);
  if (!hasRequiredOptions) {
    throw new Error(`Missing the following required mastering options: ${xdmp.describe(requiredOptionProperties.filter((propName) => !options[propName]), emptySequence, emptySequence)}`);
  }
  // set the target entity based off of the step options
  options.mergeOptions.targetEntity = options.targetEntity;
  options.matchOptions.targetEntity = options.targetEntity;
  // provide default empty array values for collections to simplify later logic
  options.mergeOptions.collections = Object.assign({"content": [], "archived": []},options.mergeOptions.collections);
  options.matchOptions.collections = Object.assign({"content": []},options.matchOptions.collections);
  // sanity check the collections set for the match/merge options
  if (options.matchOptions.collections.content.length) {
    options.mergeOptions.collections.content = options.matchOptions.collections.content;
  } else if (options.mergeOptions.collections.content.length) {
    options.matchOptions.collections.content = options.mergeOptions.collections.content;
  }
  const contentCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.content), masteringConsts['CONTENT-COLL']));
  const archivedCollection = fn.head(masteringCollections.getCollections(Sequence.from(options.mergeOptions.collections.archived), masteringConsts['ARCHIVED-COLL']));
  let contentHasExpectedContentCollection = true;
  let contentHasTargetEntityCollection = true;
  let unlockedURIs = mergeImpl.filterOutLockedUris(Sequence.from(content.toArray().map((item) => item.uri))).toArray();
  for (const item of content) {
    let docCollections = item.context.originalCollections || [];
    if (!docCollections.includes(archivedCollection) && unlockedURIs.includes(item.uri)) {
      mergeImpl.lockForUpdate(item.uri);
      item.context.collections = Sequence.from(docCollections);
      filteredContent.push(item);
      contentHasExpectedContentCollection = contentHasExpectedContentCollection && docCollections.includes(contentCollection);
      contentHasTargetEntityCollection = contentHasTargetEntityCollection && docCollections.includes(options.targetEntity);
    }
  }
  if (!contentHasExpectedContentCollection) {
    if (contentHasTargetEntityCollection) {
      xdmp.log(`Expected collection "${contentCollection}" not found on content. Using entity collection "${options.targetEntity}" instead. \
      You may need to review your match/merge options`, 'notice');
      options.matchOptions.collections.content.push(options.targetEntity);
      options.mergeOptions.collections.content.push(options.targetEntity);
    } else {
      xdmp.log(`Expected collection "${contentCollection}" not found on content. You may need to review your match/merge options`, 'warning');
    }
  }
  return { archivedCollection, contentCollection };
}

module.exports = {
  main: main,
  // export checkOptions for unit test
  checkOptions: checkOptions
};
