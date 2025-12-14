package de.svi.isi.web.monitor;

public class WebUrl {
  
  private String name;
  private String host;
  private String protokoll;
  private String status;
  private String details;
  
  public String getName() {
    return name;
  }
  
  public void setName(String name) {
    this.name = name;
  }
  
  public String getHost() {
    return host;
  }
  
  public void setHost(String host) {
    this.host = host;
  }
  
  public void setProtokoll(String protokoll) {
    this.protokoll = protokoll;
  }
  
  public String getProtokoll() {
    return protokoll;
  }
  
  public String getStatus() {
    return status;
  }
  
  public void setStatus(String status) {
    this.status = status;
  }
  
  public String getDetails() {
    return details;
  }
  
  public void setDetails(String details) {
    this.details = details;
  }
  
  @Override
  public String toString() {
    StringBuilder builder = new StringBuilder();
    builder.append("WebUrl [name=");
    builder.append(name);
    builder.append(", host=");
    builder.append(host);
    builder.append(", protokoll=");
    builder.append(protokoll);
    builder.append(", status=");
    builder.append(status);
    builder.append(", details=");
    builder.append(details);
    builder.append("]");
    return builder.toString();
  }
  
}
