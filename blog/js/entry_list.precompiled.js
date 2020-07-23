(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['entry_list'] = template({"1":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3=container.escapeExpression, alias4="function", lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <ul><a href=\"entries/"
    + alias3((lookupProperty(helpers,"pad_left")||(depth0 && lookupProperty(depth0,"pad_left"))||alias2).call(alias1,(data && lookupProperty(data,"key")),{"name":"pad_left","hash":{},"data":data,"loc":{"start":{"line":2,"column":25},"end":{"line":2,"column":42}}}))
    + ".html\">Entry "
    + alias3(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"key","hash":{},"data":data,"loc":{"start":{"line":2,"column":55},"end":{"line":2,"column":63}}}) : helper)))
    + " - <time datetime=\""
    + alias3(((helper = (helper = lookupProperty(helpers,"posted_at") || (depth0 != null ? lookupProperty(depth0,"posted_at") : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"posted_at","hash":{},"data":data,"loc":{"start":{"line":2,"column":82},"end":{"line":2,"column":95}}}) : helper)))
    + alias3(container.lambda((depths[1] != null ? lookupProperty(depths[1],"zone_at") : depths[1]), depth0))
    + "\">"
    + alias3((lookupProperty(helpers,"strip_millis")||(depth0 && lookupProperty(depth0,"strip_millis"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"posted_at") : depth0),{"name":"strip_millis","hash":{},"data":data,"loc":{"start":{"line":2,"column":111},"end":{"line":2,"column":137}}}))
    + "</time> - "
    + alias3(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias4 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":2,"column":147},"end":{"line":2,"column":156}}}) : helper)))
    + "</a></ul>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data,blockParams,depths) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"entries") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0, blockParams, depths),"inverse":container.noop,"data":data,"loc":{"start":{"line":1,"column":0},"end":{"line":3,"column":9}}})) != null ? stack1 : "");
},"useData":true,"useDepths":true});
})();