import Loggaby from 'loggaby';

export = new Loggaby({
  format: '{gray}[{level.color}{level.name} {white}|{white} {cyan}{time}{cyan}{grey}] '
});
