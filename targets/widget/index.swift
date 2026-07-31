import WidgetKit
import SwiftUI
import UIKit

private let appGroup = "group.com.digirafthub.trace"
private let snapshotUrlKey = "widgetSnapshotUrl"

struct SnapshotEntry: TimelineEntry {
  let date: Date
  let image: UIImage?
}

struct Provider: TimelineProvider {
  func placeholder(in context: Context) -> SnapshotEntry {
    SnapshotEntry(date: .now, image: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (SnapshotEntry) -> Void) {
    fetch { completion(SnapshotEntry(date: .now, image: $0)) }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<SnapshotEntry>) -> Void) {
    fetch { image in
      let entry = SnapshotEntry(date: .now, image: image)
      let next = Calendar.current.date(byAdding: .minute, value: 15, to: .now)!
      completion(Timeline(entries: [entry], policy: .after(next)))
    }
  }

  /// The app writes the token-authenticated snapshot URL into the shared
  /// app group after sign-in; the widget just fetches the PNG.
  private func fetch(_ done: @escaping (UIImage?) -> Void) {
    guard
      let raw = UserDefaults(suiteName: appGroup)?.string(forKey: snapshotUrlKey),
      let url = URL(string: raw)
    else { return done(nil) }
    var request = URLRequest(url: url)
    request.cachePolicy = .reloadIgnoringLocalCacheData
    URLSession.shared.dataTask(with: request) { data, _, _ in
      done(data.flatMap(UIImage.init(data:)))
    }.resume()
  }
}

struct TraceWidgetView: View {
  var entry: SnapshotEntry
  @Environment(\.widgetFamily) var family

  private let night = Color(red: 0.047, green: 0.043, blue: 0.063)

  var body: some View {
    Group {
      if family == .accessoryRectangular {
        // lock screen: quiet wordmark, tap opens the canvas
        VStack(alignment: .leading, spacing: 2) {
          Text("trace").font(.system(size: 15, weight: .semibold))
          Text("leave me a trace ❤").font(.system(size: 12))
        }
      } else if let image = entry.image {
        Image(uiImage: image)
          .resizable()
          .scaledToFill()
      } else {
        ZStack {
          night
          Text("leave me a trace")
            .font(.system(size: 13))
            .foregroundColor(Color(white: 0.62))
        }
      }
    }
    .containerBackground(for: .widget) { night }
  }
}

struct TraceWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "TraceWidget", provider: Provider()) { entry in
      TraceWidgetView(entry: entry)
    }
    .configurationDisplayName("Trace")
    .description("Your person's latest drawing, live on your home screen.")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
    .contentMarginsDisabled()
  }
}

@main
struct TraceWidgetBundle: WidgetBundle {
  var body: some Widget {
    TraceWidget()
  }
}
