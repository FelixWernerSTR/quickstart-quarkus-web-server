package de.fw.quarkus.web;

import java.util.logging.Logger;

import io.quarkus.runtime.Startup;
import io.quarkus.vertx.web.Route;
import io.vertx.ext.web.RoutingContext;

@Startup
public class SpaRoutes {
  
  static Logger logger = Logger.getLogger(SpaRoutes.class.getName());
  
  public SpaRoutes() {
    logger.info("initialized");
  }
  
  String base = System.getenv().getOrDefault("BASE", "/");
  
  @Route(regex = "^(\\/home|\\/about-us|\\/contacts)$", methods = Route.HttpMethod.GET)
  void spa(RoutingContext rc) {
    logger.info("redirekt to: " + base);
    rc.reroute(base);
  }
}