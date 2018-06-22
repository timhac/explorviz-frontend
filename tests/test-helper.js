import { start, setResolver } from 'ember-cli-qunit';
import resolver from './helpers/resolver';

setResolver(resolver);
start();
