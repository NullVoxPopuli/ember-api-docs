import { hash, resolve } from 'rsvp';
import Route from '@ember/routing/route';
import getLastVersion from 'ember-api-docs/utils/get-last-version';
import { pluralize } from 'ember-inflector';

export default Route.extend({

  model(params) {
    return this.get('store').findRecord('project', 'ember-data', { includes: 'project-version' })
      .then((project) => {
        let versions = project.get('projectVersions').toArray();
        let lastVersion = getLastVersion(versions);
        let className = params['module'].substr(0, params['module'].lastIndexOf('.'));
        let id = `ember-data-${lastVersion}-${className}`;
        return hash({
          project: resolve(project),
          version: resolve(lastVersion),
          classData: this.store.find('class', id)
            .then((classData) => {
              return {
                type: 'class',
                data: classData
              };
            })
            .catch((e) => {
              return this.transitionTo('project-version');
            })
        });
      });
  },

  redirect(model) {
    return this.transitionTo(`project-version.${pluralize(model.classData.type)}.${model.classData.type}`,
      model.project.id,
      model.version,
      model.classData.data.get('name'));
  },

  serialize(model) {
    return {
      namespace: model.classData.get('name')
    }
  }

});
