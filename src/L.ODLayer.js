/**
 * class L.ODLayer()
 * 
 * (extends L.GeoJSON)
 * 
 * <DESCRIPTION>
 * 
 */

L.ODLayer = L.GeoJSON.extend({
    options: {
        data: null,
        mode: 1, 
        attributes: {},
        pointStyle: {},
        lineStyle: {},
    },

    // variables for plugin scope
    _defaultAttributes: {
        id: "id",
        value: "value"
    },
    _defaultPointStyle: {
        radius: 8,
        fillColor: "#1f78b4",
        fillColorSelected: "red", 
        color: "black",
        weight: 2,
        opacity: 1.0,
        fillOpacity: 1.0,
    },
    _defaultLineStyle: { 
        color: "lightblue",
        colorSelected: "red",
        weight: 2,
        opacity: 0,
        opacitySelected: 0.6,
        sizeFactor: 1,
    },
    _selectedIds: [],

    // functions
    initialize: function(features, options){
        this._validateStyles();
        this._validateAttributes();
        options["pointToLayer"] = function(features, latlng) {
            return L.circleMarker(latlng)             
        };
        L.GeoJSON.prototype.initialize.call(this, features, options);

        this.createODlinks();
    },

    createODlinks: function(){
        let attributes = this.options.attributes;
        let lines = [];

        let layers = this._layers;
        for (let i in layers) {
            let oLayer = layers[i];
            let oId = oLayer.feature.properties[attributes.id];
            let oCoords = oLayer.feature.geometry.coordinates.slice();

            for (let j in layers){
                if (i != j) {
                    let dLayer = layers[j];
                    let dId = dLayer.feature.properties[attributes.id];
                    let dCoords = dLayer.feature.geometry.coordinates.slice();
                    
                    let link = [[oCoords[1], oCoords[0]], [dCoords[1], dCoords[0]]];
                    link = L.polyline(link, {
                        interactive: false,
                    });
                    link["properties"] = {
                        "from": oId,
                        "to": dId,
                    };
                    lines.push(link);
                }
            }
        }

        for (var i in lines) {
            lines[i].addTo(this);
        }
    },

    onAdd: function(map) {
        L.GeoJSON.prototype.onAdd.call(this, map);
        this.setStyle();
    },

    setStyle: function () {
        this._validateAttributes();
        this._validateStyles();

        let options = this.options;
        let data = this.options.data;
        let attributes = this.options.attributes;
        let pointStyle = this.options.pointStyle;
        let lineStyle = this.options.lineStyle;

        let layers = this._layers;
        for (let key in layers){ 
            let layer = layers[key];

            if (layer instanceof L.CircleMarker) {
                let id = layer.feature.properties[attributes.id];
                let style = Object.assign({}, pointStyle);
                if (this._selectedIds.indexOf(id) != -1) 
                    style.fillColor = style.fillColorSelected;
                layer.setStyle(style);
            } else if (layer instanceof L.Polyline) {
                let from = layer.properties.from;
                let to = layer.properties.to;
                let id = from + "-" + to;
                let style = Object.assign({}, lineStyle);

                if ((options.mode == 1 && this._selectedIds.indexOf(from) == -1) || 
                    (options.mode == 2 && this._selectedIds.index(to) == -1)) {
                        style.opacity = style.opacity;
                } else {
                    style.opacity = lineStyle.opacitySelected;
                    style.color = lineStyle.colorSelected;
                    style.weight = data[id][attributes.value] * style.sizeFactor;
                    layer.bringToFront();
                }

                layer.setStyle(style);
            } 
        }
    },

    _validateAttributes: function() {
        let attributes = this.options.attributes;
        if (attributes == null | attributes == undefined) attributes = Object.assign({}, this._defaultAttributes);
        else {
            for (key in this._defaultAttributes){
                if (!(key in attributes)) attributes[key] = this._defaultAttributes[key];
            }
        }
    },

    _validateStyles: function() {
        // Point style
        let style = this.options.pointStyle;
        if (style == null | style == undefined) style = Object.assign({}, this._defaultPointStyle);
        else {
            for (key in this._defaultPointStyle){
                if (!(key in style)) style[key] = this._defaultPointStyle[key];
            }
        }

        // Line style
        style = this.options.lineStyle;
        if (style == null | style == undefined) style = Object.assign({}, this._defaultLineStyle);
        else {
            for (key in this._defaultLineStyle){
                if (!(key in style)) style[key] = this._defaultLineStyle[key];
            }
        }
    },

    updateData: function(data){
        this.options.data = data;
        this.setStyle();
    },

    updatePointStyle: function(style){
        this.options.pointStyle = style;
        this.setStyle();
    },

    updateLineStyle: function(style){
        this.options.lineStyle = style;
        this.setStyle();
    },

    updateAttributes: function(attributes){
        this.options.attributes = attributes;
        this.setStyle();
    },

    selectFeature: function(id, clear=false) {
        if (clear) this.clearSelection();
        if (this._selectedIds.indexOf(id) == -1) {this._selectedIds.push(id)};

        this.setStyle();
    },

    unselectFeature: function(id) {
        const index = this._selectedIds.indexOf(id);
        if (index == -1) this._selectedIds.splice(index, 1);

        this.setStyle();
    },

    clearSelection: function() {
        delete(this._selectedIds);
        this._selectedIds = [];

        this.setStyle();
    },
});

L.odLayer = function (geojson, options) {
    return new L.ODLayer(geojson, options);
}

module.exports = L.odLayer;