/* eslint-disable max-len */
module.exports.fieldTemplate = function (inner) {
  return '<div class="<%= cls.groupClass %> jsonform-node jsonform-error-<%= keydash %>' +
    '<%= elt.htmlClass ? " " + elt.htmlClass : "" %>' +
    '<%= (node.required && node.formElement && (node.formElement.type !== "checkbox") ? " jsonform-required" : "") %>' +
    '<%= (node.isReadOnly() ? " jsonform-readonly" : "") %>' +
    '<%= (node.disabled ? " jsonform-disabled" : "") %>' +
    '" data-jsonform-type="<%= node.formElement.type %>">' +
    '<% if (node.title && !elt.notitle && elt.inlinetitle !== true) { %>' +
      '<label class="<%= cls.labelClass %>" for="<%= node.id %>"><%= node.title %></label>' +
    '<% } %>' +
    '<div class="<%= cls.controlClass %>">' +
      '<% if (node.prepend || node.append) { %>' +
        '<div class="<%= node.prepend ? cls.prependClass : "" %> ' +
        '<%= node.append ? cls.appendClass : "" %>">' +
        '<% if (node.prepend && node.prepend.indexOf("<button ") >= 0) { %>' +
          '<% if (cls.buttonAddonClass) { %>' +
            '<span class="<%= cls.buttonAddonClass %>"><%= node.prepend %></span>' +
          '<% } else { %>' +
            '<%= node.prepend %>' +
          '<% } %>' +
        '<% } %>' +
        '<% if (node.prepend && node.prepend.indexOf("<button ") < 0) { %>' +
          '<span class="<%= cls.addonClass %>"><%= node.prepend %></span>' +
        '<% } %>' +
      '<% } %>' +
      inner +
      '<% if (node.append && node.append.indexOf("<button ") >= 0) { %>' +
        '<% if (cls.buttonAddonClass) { %>' +
          '<span class="<%= cls.buttonAddonClass %>"><%= node.append %></span>' +
        '<% } else { %>' +
          '<%= node.append %>' +
        '<% } %>' +
      '<% } %>' +
      '<% if (node.append && node.append.indexOf("<button ") < 0) { %>' +
        '<span class="<%= cls.addonClass %>"><%= node.append %></span>' +
      '<% } %>' +
      '<% if (node.prepend || node.append) { %>' +
        '</div>' +
      '<% } %>' +
      '<% if (node.description) { %>' +
        '<span class="form-text text-muted small jsonform-description"><%= node.description %></span>' +
      '<% } %>' +
      '<span class="form-text text-muted small jsonform-errortext" style="display:none;"></span>' +
    '</div></div>';
};

module.exports.fieldsetTemplate =
  '<fieldset class="jsonform-node jsonform-error-<%= keydash %> <% if (elt.expandable) { %>expandable<% } %> <%= elt.htmlClass?elt.htmlClass:"" %>" ' +
  '<% if (id) { %> id="<%= id %>"<% } %>' +
  ' data-jsonform-type="fieldset">' +
  '<% if (node.title || node.legend) { %><legend><%= node.title || node.legend %></legend><% } %>' +
  '<% if (elt.expandable) { %><div class="<%= cls.groupClass %>"><% } %>' +
  '<%= children %>' +
  '<% if (elt.expandable) { %></div><% } %>' +
  '<span class="form-text text-muted small jsonform-errortext" style="display:none;"></span>' +
  '</fieldset>';
/*eslint-enable max-len*/

module.exports.loadSettingsTemplate = `
<div class='alert alert-warning msg-loading'>
  <p>Load settings...</p>
  <div class="progress">
    <div class="progress-bar"></div>
  </div>
</div>`;

module.exports.saveSettingsTemplate = `
<div class='alert alert-warning msg-saving'>
  <p>Save settings...</p>
  <div class="progress">
    <div class="progress-bar"></div>
  </div>
</div>`;

module.exports.fatalErrorTemplate = `
<div class='alert alert-danger msg-fatal'>
  <pre><code class='msg-fatal-code'></code></pre>
</div>`;
